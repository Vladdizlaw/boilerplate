import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { IUserRepository } from 'src/domain/ports/user.repository.interface';
import {
  IUser,
  IUserProfile,
  UserRole,
} from 'src/domain/interfaces/user.interface';
import { Prisma } from '@prisma/client';
import {
  CreateUserDao,
  UpdateUserProfileDao,
} from 'src/domain/entities/user.entity';

import { ResourceEnum } from 'src/domain/interfaces/attachment.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userDao: CreateUserDao): Promise<Partial<IUser>> {
    const userExists = await this.prismaService.user.findUnique({
      where: { email: userDao.email },
    });
    if (userExists) {
      throw new Error('User with same email already exists');
    }
    const userCreateInput = {
      email: userDao.email,
      password_hash: userDao.password_hash || null,
      provider: userDao.provider || null,
      provider_id: userDao.provider_id || null,
      role: UserRole.USER,
      profile: {
        create: {
          first_name: userDao.first_name,
          last_name: userDao.last_name,
          phone: userDao.phone || null,
        },
      },
      user_agreements: {
        create: {
          terms_and_conditions: userDao.terms_and_conditions,
          updates_and_promotions: userDao.updates_and_promotions || false,
        },
      },
      user_confirmations: {
        create: {
          email: false,
          phone: false,
        },
      },
    } as Prisma.UserCreateInput;
    await this.prismaService.user.create({
      data: userCreateInput,
    });

    const userFindUniqueArgs = {
      where: { email: userDao.email },
      include: {
        profile: true,
        user_agreements: true,
        user_confirmations: true,
      },
    } as Prisma.UserFindUniqueArgs;
    return this.prismaService.user.findFirst(userFindUniqueArgs);
  }

  async findUser(id: number): Promise<IUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    return user;
  }

  async findOne(id: number): Promise<any> {
    const params = {
      where: { id },
      include: {
        profile: true,
        user_agreements: true,
        user_confirmations: true,
      },
    } as Prisma.UserFindUniqueArgs;
    const user = await this.prismaService.user.findFirst(params);
    const attachments = await this.prismaService.attachment.findMany({
      where: {
        resource: ResourceEnum.USER,
        resource_id: user.id,
      },
    });

    return {
      ...user,
      attachments,
    };
  }

  async find(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<any> {
    const { skip, take, cursor, where, orderBy } = params;
    const findParams = {
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        profile: true,
        user_agreements: true,
        user_confirmations: true,
      },
    } as Prisma.UserFindManyArgs;
    return this.prismaService.user.findMany(findParams);
  }

  async updateProfile(
    userId: number,
    user: Partial<IUserProfile>,
    images?: number[],
  ): Promise<IUser> {
    const userExists = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new Error('User not found');
    }
    const result = await this.prismaService
      .$transaction(async (prisma) => {
        const updatedProfile = await prisma.userProfile.update({
          where: { user_id: userId },
          data: user as Prisma.UserProfileUpdateInput,
        });
        if (images?.length > 0) {
          await prisma.attachment.updateMany({
            where: {
              id: {
                in: images,
              },
              user_id: userId,
              resource: ResourceEnum.USER,
            },
            data: {
              resource_id: userId,
            },
          });
        }
      })
      .then(async () => {
        return this.findOne(userId);
      });
    return result;
  }

  async update(userId: number, user: Partial<IUser>): Promise<IUser> {
    const userExists = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new Error('User not found');
    }
    const result = await this.prismaService
      .$transaction(async (prisma) => {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: user as Prisma.UserUpdateInput,
        });
        // if (user.images?.length > 0) {
        //   await prisma.attachment.updateMany({
        //     where: {
        //       id: {
        //         in: user.images,
        //       },
        //       user_id: id,
        //       resource: ResourceEnum.USER,
        //     },
        //     data: {
        //       resource_id: id,
        //     },
        //   });
        // }
      })
      .then(async () => {
        return this.prismaService.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            user_agreements: true,
            user_confirmations: true,
          },
        });
      });
    return result;
  }

  async findBy(params: Partial<IUser>): Promise<IUser[]> {
    return this.prismaService.user.findMany({
      where: params,
      include: {
        profile: true,
        user_agreements: true,
        user_confirmations: true,
      },
    });
  }

  async delete(id: number) {}

  async findWithParams(
    pageOptions: {
      readonly page?: number;
      readonly take?: number;
      skip: number;
      readonly order?: 'ASC' | 'DESC';
    },
    filterParams?: {
      [key: string]: any[];
    },
    searchParams?: string,
    sortParams?: {
      property: string;
      direction: 'ASC' | 'DESC';
    },
  ): Promise<{ users: IUser[]; count: number }> {
    const { take, skip } = pageOptions;
    const { property, direction } = sortParams;
    let whereQ;
    if (filterParams) {
      whereQ = Object.keys(filterParams)
        .map((key) => {
          return `users.${key} in ('${filterParams[key]}')`;
        })
        .join(' and ');
    }

    if (searchParams) {
      whereQ = whereQ.concat(
        ` ${whereQ.length ? 'and' : ''} user_profiles.last_name::text like '%${searchParams.replaceAll("'", "''")}%'`,
      );
    }

    let query = `select 
                users.*,
                user_profiles.first_name,
                user_profiles.last_name
             from users 
             left join user_profiles on user_profiles.user_id = users.id  
            `;
    if (whereQ) {
      query = query.concat(` where ${whereQ}`);
    }

    query = query.concat(
      ` order by users.${property} ${direction} limit ${take} offset ${skip}   `,
    );

    console.log({ query });
    const users = (await this.prismaService.$queryRawUnsafe(query)) as IUser[];
    console.log(users);

    const queryCount = `select count(*)::int from users ${whereQ ? 'where ' + whereQ : ''}`;
    const [{ count }] = (await this.prismaService.$queryRawUnsafe(
      queryCount,
    )) as { count: number }[];

    return { users, count };
  }
}
