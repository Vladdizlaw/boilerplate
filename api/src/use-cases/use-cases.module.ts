import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';

@Module({
  imports: [DatabaseModule, PrismaModule],
  providers: [],
  exports: [],
})
export class UseCasesModule {}
