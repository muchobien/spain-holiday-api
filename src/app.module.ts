import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CalendarModule } from './calendar/calendar.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapperService } from './scrapper/scrapper.service';
@Module({
  imports: [CalendarModule, ScheduleModule.forRoot()],
  providers: [PrismaService, ScrapperService],
})
export class AppModule {}
