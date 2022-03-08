import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { HolidayType } from '@prisma/client';
import { chromium } from 'playwright';
import { PrismaService } from 'src/prisma/prisma.service';
import autonomousEntitiesJSON from '../../autonomous_entities.json';

type ScrappedData = {
  name: string;
  provinces: {
    name: string;
    towns: {
      name: string;
      holidays: {
        description: string;
        date: Date;
        type: HolidayType;
      }[];
    }[];
  }[];
};

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private static readonly uri =
    'https://www.seg-social.es/wps/portal/wss/internet/CalendarioLaboral/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8zijQw9TTxMDAx9Lcy9nA0c_Xw8TJydDYDAXD8cVYGBgbOpgWOQpbtPcFiwoYGFsX4UMfoNcABHA8L6o1CVYHEBWAEeK4JT8_QLckMjDLJMFAH0ywTE/?changeLanguage=es';

  constructor(private prisma: PrismaService) {}
  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  @Timeout(1000)
  async task() {
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      bypassCSP: true,
    });

    await page.goto(ScrapperService.uri);

    const provinces = await page.$$eval('#Provincia option', (elements) =>
      elements
        .map((element: HTMLOptionElement) => element.value)
        .filter((value) => !['00', '60#Servicios Centrales'].includes(value)),
    );
    const scrappedData: ScrappedData[] = [];

    autonomousEntitiesJSON.forEach((element) => {
      scrappedData.push({
        name: element.name,
        provinces: [],
      });
    });

    for (const province of provinces) {
      const provinceElement = await page.$('#Provincia');
      await provinceElement.selectOption(province);
      await page.waitForTimeout(1000);
      const provinceName = province.split('#')[1];
      const autonomousEntity = autonomousEntitiesJSON.find((data) =>
        data.provinces.find((element) => element === province.split('#')[0]),
      ).name;
      const currentAutonomousEntity = scrappedData.find(
        (element) => element.name === autonomousEntity,
      );

      currentAutonomousEntity.provinces.push({
        name: provinceName,
        towns: [],
      });

      this.logger.log(`Starting with ${provinceName}!`);

      const towns = await page.$$eval('#Localidades option', (elements) =>
        elements
          .map((element: HTMLOptionElement) => element.value)
          .filter((value) => value !== '000'),
      );

      for (const town of towns) {
        const townElement = await page.$('#Localidades');
        await townElement.selectOption(town);
        await page.waitForTimeout(1000);

        const holidays = await page.$$eval(
          'td[class*=public-holiday]',
          (elements) => {
            const typeMap = {
              Loc: 'LOCAL',
              Aut: 'AUTONOMOUS',
              Nac: 'NATIONAL',
            } as Record<string, HolidayType>;

            return elements.map((element) => {
              const monthMap = {
                Ene: '01',
                Feb: '02',
                Mar: '03',
                Abr: '04',
                May: '05',
                Jun: '06',
                Jul: '07',
                Ago: '08',
                Sep: '09',
                Oct: '10',
                Nov: '11',
                Dic: '12',
              };
              const day = element.textContent.replace(/\s/g, '');
              const month =
                monthMap[
                  element.parentElement.parentElement.parentElement.innerHTML
                    .replace(/\s/g, '')
                    .split('</caption>')[0]
                    .replace('<caption>', '')
                    .slice(0, 3)
                ];
              const year = new Date().getFullYear();

              return {
                description: element.ariaLabel.split(':')[1].trim(),
                date: new Date(`${month}-${day}-${year} UTC`),
                type: typeMap[
                  element.ariaLabel
                    .split(':')[0]
                    .replace('Festividad ', '')
                    .slice(0, 3)
                ],
              };
            });
          },
        );

        currentAutonomousEntity.provinces[
          currentAutonomousEntity.provinces.length - 1
        ].towns.push({
          name: town.split('#')[1],
          holidays: holidays,
        });
      }

      this.logger.log(`Ending with ${provinceName}!`);
    }

    for (const element of scrappedData) {
      await this.prisma.administrativeLevel1.create({
        data: {
          name: element.name,
          al2: {
            create: element.provinces.map((province) => ({
              name: province.name,
              al3: {
                create: province.towns.map((town) => ({
                  name: town.name,
                  holidays: {
                    createMany: {
                      data: town.holidays,
                    },
                  },
                })),
              },
            })),
          },
        },
      });
    }

    await browser.close();
  }
}
