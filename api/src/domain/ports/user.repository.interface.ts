import { CreateUserDao, UpdateUserProfileDao } from '../entities/user.entity';
import { IUser, IUserProfile } from '../interfaces/user.interface';
import { IBaseRepository } from './base-repository.interface';

export interface IUserRepository extends IBaseRepository<IUser> {
  findUser(id: number): Promise<IUser>;
  findWithParams(
    pageOptionsDto: {
      readonly page: number;
      readonly take: number;
      skip: number;
      readonly order?: 'ASC' | 'DESC';
    },
    filterParams: {
      [key: string]: any[];
    },
    searchParams: string,
    sortParams: {
      property: string;
      direction: 'ASC' | 'DESC';
    },
  ): Promise<{ users: IUser[]; count: number }>;
}

export abstract class UserRepository implements IUserRepository {
  abstract create(data: CreateUserDao): Promise<IUser>;
  abstract update(id: number, data: Partial<IUser>): Promise<IUser>;
  abstract updateProfile(
    id: number,
    data: UpdateUserProfileDao,
    images?: number[],
  ): Promise<IUser>;
  abstract delete(id: number): Promise<void>;
  abstract findOne(id: number): Promise<IUser>;
  abstract find(params: Partial<IUser>): Promise<IUser[]>;
  abstract findUser(id: number): Promise<IUser>;
  abstract findWithParams(
    pageOptionsDto: {
      readonly page?: number;
      readonly take?: number;
      skip: number;
      readonly order?: 'ASC' | 'DESC';
    },
    filterParams: {
      [key: string]: any[];
    },
    searchParams: string,
    sortParams: {
      property: string;
      direction: 'ASC' | 'DESC';
    },
  ): Promise<{ users: IUser[]; count: number }>;
}
