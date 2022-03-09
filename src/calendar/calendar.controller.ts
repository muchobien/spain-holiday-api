import { Controller, Get, Param, Query } from '@nestjs/common';
import { HolidayType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('festivos')
export class CalendarController {
  constructor(private prisma: PrismaService) {}

  @Get('provincias/:provinceName')
  async getProvinceHolidays(
    @Param('provinceName') provinceName: string,
    @Query('type') type?: HolidayType,
    @Query('month') date?: number,
  ) {
    const province = await this.prisma.administrativeLevel2.findUnique({
      where: {
        name: provinceName,
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
                  gte: new Date(),
                  lte: new Date(),
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
}
