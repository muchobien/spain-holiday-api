import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('calendar')
export class CalendarController {
  @Get('hola')
  getHello() {
    return 'hola';
  }
  @Post('manolito')
  postManolito(@Body('name') name: string) {
    return { name };
  }
  @Post('manolito/:holita')
  postManolito2(@Param('holita') name: string) {
    return { name };
  }
}
