import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { chromium } from 'playwright';

type ScrappedData = {
  province: string;
  towns: {
    name: string;
    holidays: {
      description: string;
      date: string;
      type: string;
    }[];
  }[];
};

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private static readonly uri =
    'https://www.seg-social.es/wps/portal/wss/internet/CalendarioLaboral/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8zijQw9TTxMDAx9Lcy9nA0c_Xw8TJydDYDAXD8cVYGBgbOpgWOQpbtPcFiwoYGFsX4UMfoNcABHA8L6o1CVYHEBWAEeK4JT8_QLckMjDLJMFAH0ywTE/?changeLanguage=es';

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
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
        .filter((value) => !['00', 'Servicios'].includes(value)),
    );

    const scrappedData: ScrappedData[] = [];

    for (const province of provinces) {
      const provinceElement = await page.$('#Provincia');
      await provinceElement.selectOption(province);
      await page.waitForTimeout(1000);
      const provinceName = province.split('#')[1];

      scrappedData.push({
        province: provinceName,
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
            return elements.map((element) => ({
              description: element.ariaLabel.split(':')[1].trim(),
              date: element.textContent
                .replace(/\s/g, '')
                .concat('-')
                .concat(
                  element.parentElement.parentElement.parentElement.innerHTML
                    .replace(/\s/g, '')
                    .split('</caption>')[0]
                    .replace('<caption>', ''),
                ),
              type: element.ariaLabel.split(':')[0].replace('Festividad ', ''),
            }));
          },
        );

        scrappedData[scrappedData.length - 1].towns.push({
          name: town.split('#')[1],
          holidays: holidays,
        });
      }
      this.logger.log(`Ending with ${provinceName}!`);
    }
    //TODO: SAVE ON DATABASE
    await browser.close();
  }
}
