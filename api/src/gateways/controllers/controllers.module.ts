import { Module } from '@nestjs/common';
// import { UseCasesModule } from 'src/use-cases/use-cases.module';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from 'src/infrastructure/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [],
  controllers: [AuthController],
})
export class ControllersModule {}
