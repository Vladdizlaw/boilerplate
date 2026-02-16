import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { IAttachmentRepository } from 'src/domain/ports/attachment.repository.interface';
import {
  IAttachment,
  ICreateAttachmentDao,
  ResourceEnum,
} from 'src/domain/interfaces/attachment.interface';

@Injectable()
export class PrismaAttachmentRepository implements IAttachmentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(attachmentDao: ICreateAttachmentDao): Promise<IAttachment> {
    const attachmentCreateInput = {
      original_file_name: attachmentDao.original_file_name,
      file_name: attachmentDao.file_name,
      file_type: attachmentDao.file_type,
      path: attachmentDao.path,
      user_id: attachmentDao.user_id,
      resource_id: attachmentDao.resource_id || null,
      resource: attachmentDao.resource,
    } as Prisma.AttachmentUncheckedCreateInput;
    const attachment = await this.prismaService.attachment.create({
      data: attachmentCreateInput,
    });

    return attachment;
  }

  async findOne(id: number): Promise<any> {
    const params = {
      where: { id },
    } as Prisma.AttachmentFindUniqueArgs;
    // const user = this.prismaService.user.findFirst(params);
    return this.prismaService.attachment.findFirst(params);
  }

  async findMany(ids: number[], userId: number): Promise<IAttachment[]> {
    return this.prismaService.attachment.findMany({
      where: {
        id: {
          in: ids,
        },
        user_id: userId,
      },
    });
  }

  async find(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AttachmentWhereUniqueInput;
    where?: Prisma.AttachmentWhereInput;
    orderBy?: Prisma.AttachmentOrderByWithRelationInput;
  }): Promise<any> {
    const { skip, take, cursor, where, orderBy } = params;
    const findParams = {
      skip,
      take,
      cursor,
      where,
      orderBy,
    } as Prisma.AttachmentFindManyArgs;
    return this.prismaService.attachment.findMany(findParams);
  }

  async update(
    id: number,
    attachment: Partial<IAttachment>,
  ): Promise<IAttachment> {
    const attachmentExists = await this.prismaService.attachment.findUnique({
      where: { id },
    });
    if (!attachmentExists) {
      throw new Error('Attachment not found');
    }
    await this.prismaService.attachment.update({
      where: { id },
      data: { ...attachment },
    });
    return this.prismaService.attachment.findUnique({
      where: { id },
    });
  }

  async findBy(
    resource: ResourceEnum,
    userId?: number,
    resourceId?: number,
  ): Promise<IAttachment[]> {
    return this.prismaService.attachment.findMany({
      where: {
        resource,
        resource_id: resourceId,
        user_id: userId,
      },
    });
  }

  async delete(id: number) {}
}
