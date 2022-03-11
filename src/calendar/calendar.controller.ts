import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import dayjs from 'dayjs';
import { QueryFilter } from './dto/calendar.input';
import { ScrappedData } from 'src/scrapper/scrapper';

@Controller('festivos')
export class CalendarController {
  constructor(private prisma: PrismaService) {}

  @Get('comautonomas/:id')
  async getAutonomousCommunity(
    @Param('id') id: string,
    @Query() { type, month }: QueryFilter,
  ) {
    const currentYear = dayjs().year();
    const autonomous = await this.prisma.administrativeLevel1.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        provinces: {
          select: {
            name: true,
            towns: {
              select: {
                name: true,
                holidays: {
                  where: {
                    type: type,
                    date: {
                      gte:
                        month !== undefined
                          ? new Date(`${month}-01-${currentYear} UTC`)
                          : new Date(`01-01-${currentYear} UTC`),
                      lte:
                        month !== undefined
                          ? new Date(
                              `${month}-${dayjs()
                                .month(month - 1)
                                .daysInMonth()}-${currentYear} UTC`,
                            )
                          : new Date(`12-31-${currentYear} UTC`),
                    },
                  },
                  select: {
                    description: true,
                    date: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return autonomous;
  }

  @Get('comautonomas')
  async getAllAutonomousCommunities(@Query() { type, month }: QueryFilter) {
    const currentYear = dayjs().year();
    const autonomous = await this.prisma.administrativeLevel1.findMany({
      select: {
        name: true,
        provinces: {
          select: {
            name: true,
            towns: {
              select: {
                name: true,
                holidays: {
                  where: {
                    type: type,
                    date: {
                      gte:
                        month !== undefined
                          ? new Date(`${month}-01-${currentYear} UTC`)
                          : new Date(`01-01-${currentYear} UTC`),
                      lte:
                        month !== undefined
                          ? new Date(
                              `${month}-${dayjs()
                                .month(month - 1)
                                .daysInMonth()}-${currentYear} UTC`,
                            )
                          : new Date(`12-31-${currentYear} UTC`),
                    },
                  },
                  select: {
                    description: true,
                    date: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return autonomous;
  }

  @Get('provincias/:id')
  async getProvinceHolidays(
    @Param('id') id: string,
    @Query() { type, month }: QueryFilter,
  ) {
    const currentYear = dayjs().year();
    const province = await this.prisma.administrativeLevel2.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        towns: {
          select: {
            name: true,
            holidays: {
              where: {
                type: type,
                date: {
                  gte:
                    month !== undefined
                      ? new Date(`${month}-01-${currentYear} UTC`)
                      : new Date(`01-01-${currentYear} UTC`),
                  lte:
                    month !== undefined
                      ? new Date(
                          `${month}-${dayjs()
                            .month(month - 1)
                            .daysInMonth()}-${currentYear} UTC`,
                        )
                      : new Date(`12-31-${currentYear} UTC`),
                },
              },
              select: {
                description: true,
                date: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return province;
  }

  @Get('provincias')
  async getAllProvincesHolidays(@Query() { type, month }: QueryFilter) {
    const currentYear = dayjs().year();
    const province = await this.prisma.administrativeLevel2.findMany({
      select: {
        name: true,
        towns: {
          select: {
            name: true,
            holidays: {
              where: {
                type: type,
                date: {
                  gte:
                    month !== undefined
                      ? new Date(`${month}-01-${currentYear} UTC`)
                      : new Date(`01-01-${currentYear} UTC`),
                  lte:
                    month !== undefined
                      ? new Date(
                          `${month}-${dayjs()
                            .month(month - 1)
                            .daysInMonth()}-${currentYear} UTC`,
                        )
                      : new Date(`12-31-${currentYear} UTC`),
                },
              },
              select: {
                description: true,
                date: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return province;
  }

  @Get('localidades/:id')
  async getTownHolidays(
    @Param('id') id: string,
    @Query() { type, month }: QueryFilter,
  ) {
    const currentYear = dayjs().year();
    const town = await this.prisma.administrativeLevel3.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        holidays: {
          where: {
            type: type,
            date: {
              gte:
                month !== undefined
                  ? new Date(`${month}-01-${currentYear} UTC`)
                  : new Date(`01-01-${currentYear} UTC`),
              lte:
                month !== undefined
                  ? new Date(
                      `${month}-${dayjs()
                        .month(month - 1)
                        .daysInMonth()}-${currentYear} UTC`,
                    )
                  : new Date(`12-31-${currentYear} UTC`),
            },
          },
          select: {
            description: true,
            date: true,
            type: true,
          },
        },
      },
    });

    return town;
  }

  @Get('localidades')
  async getAllTownsHolidays(@Query() { type, month }: QueryFilter) {
    const currentYear = dayjs().year();
    const town = await this.prisma.administrativeLevel3.findMany({
      select: {
        name: true,
        holidays: {
          where: {
            type: type,
            date: {
              gte:
                month !== undefined
                  ? new Date(`${month}-01-${currentYear} UTC`)
                  : new Date(`01-01-${currentYear} UTC`),
              lte:
                month !== undefined
                  ? new Date(
                      `${month}-${dayjs()
                        .month(month - 1)
                        .daysInMonth()}-${currentYear} UTC`,
                    )
                  : new Date(`12-31-${currentYear} UTC`),
            },
          },
          select: {
            description: true,
            date: true,
            type: true,
          },
        },
      },
    });

    return town;
  }

  @Post('scrapper')
  async postData(@Body() scrappedData: ScrappedData[]) {
    for (const element of scrappedData) {
      await this.prisma.administrativeLevel1.create({
        data: {
          name: element.name,
          provinces: {
            create: element.provinces.map((province) => ({
              name: province.name,
              towns: {
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
  }
}
