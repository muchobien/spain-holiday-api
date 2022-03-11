import { HolidayType } from '@prisma/client';
import { IsOptional, IsEnum, IsNumberString } from 'class-validator';

export class QueryFilter {
  @IsOptional()
  @IsNumberString()
  month?: number;

  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;
}
