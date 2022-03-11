import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CalendarModule } from './calendar/calendar.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [CalendarModule, ScheduleModule.forRoot(), HttpModule],
  providers: [PrismaService],
})
export class AppModule {}
