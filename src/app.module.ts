import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [CalendarModule],
  providers: [PrismaService],
})
export class AppModule {}
