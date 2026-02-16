import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface Filtering {
  [key: string]: any[];
}

export const FilteringParams = createParamDecorator(
  (data, ctx: ExecutionContext): Filtering => {
    const req: Request = ctx.switchToHttp().getRequest();
    const filter = req.query.filter as Filtering;
    if (!filter) return {};
    if (typeof data != 'object')
      throw new BadRequestException('Invalid filter parameter');
    const properties = [...Object.keys(filter)];
    if (!properties.every((property) => data.includes(property)))
      throw new BadRequestException(`Invalid filter property: ${properties}`);
    return filter;
  },
);
