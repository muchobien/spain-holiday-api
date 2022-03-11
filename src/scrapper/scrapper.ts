import { HolidayType } from '@prisma/client';

export type ScrappedData = {
  name: string;
  provinces: {
    name: string;
    towns: {
      name: string;
      holidays: {
        description: string;
        date: Date;
        type: HolidayType;
      }[];
    }[];
  }[];
};
