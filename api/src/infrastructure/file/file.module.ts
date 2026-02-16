import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [MulterModule.register(), DatabaseModule, ConfigModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
