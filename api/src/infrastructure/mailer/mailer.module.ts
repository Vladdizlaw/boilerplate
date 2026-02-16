import { Module } from '@nestjs/common';
import { EmailService } from './mailer.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../configs/jwt.config';

// This module is used to send emails
// It is used in the auth module to send verification emails
// It is also used in the user module to send password reset emails
// It is also used in the user module to send email notifications

@Module({
  providers: [EmailService],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
})
export class MailModule {}
