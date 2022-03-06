import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CalendarController } from './calendar.controller';

@Module({
  controllers: [CalendarController],
  providers: [PrismaService],
})
export class CalendarModule {}
