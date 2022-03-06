import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('calendar')
export class CalendarController {
  constructor(private prisma: PrismaService) {}
}
