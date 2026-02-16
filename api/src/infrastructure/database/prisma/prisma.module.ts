import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/user.repository';
import { UserRepository } from 'src/domain/ports/user.repository.interface';
import { AttachmentRepository } from 'src/domain/ports/attachment.repository.interface';
import { PrismaAttachmentRepository } from './repositories/attachment.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },

    {
      provide: AttachmentRepository,
      useClass: PrismaAttachmentRepository,
    },
  ],
  exports: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },

    {
      provide: AttachmentRepository,
      useClass: PrismaAttachmentRepository,
    },
  ],
})
export class PrismaModule {}
