// import { SortQueryParam } from './../../dist/decorators/sorting.decorator.d';
import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
export interface SortQueryParamDto {
  field: string;
  order: string;
}
export interface Sorting {
  property: string;
  direction: 'ASC' | 'DESC';
}

export const SortingParams = createParamDecorator(
  (validParams, ctx: ExecutionContext): Sorting => {
    const req: Request = ctx.switchToHttp().getRequest();
    const sort = req.query.sort as any;
    console.log({ sort });
    if (!sort) return { property: 'created_at', direction: 'DESC' };
    const { field: property, order: direction } = sort;

    // check if the valid params sent is an array
    if (typeof validParams != 'object')
      throw new BadRequestException('Invalid sort parameter');

    // check the format of the sort query param
    const directionWhitelist = ['asc', 'desc'];
    if (!directionWhitelist.includes(direction))
      throw new BadRequestException('Invalid sort parameter');

    // extract the property name and direction and check if they are valid
    // const [property, direction] = sort.split(':')
    if (!validParams.includes(property))
      throw new BadRequestException(`Invalid sort property: ${property}`);

    return { property, direction };
  },
);
