import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { resolve } from 'path';
import VerificationTokenPayload from './verification-token-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
// import { IUser } from 'src/domain/interfaces/user.interface';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async sendEmailConfirmationLink(
    account: any,
    //  IUser
  ) {
    const payload: VerificationTokenPayload = { email: account.email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1d',
    });
    const confirmUrl = `${this.configService.get('MAIL_CONFIRM_URL')}?token=${token}`;
    await this.mailerService
      .sendMail({
        to: account.email,
        subject: 'Confirm email',
        template: resolve('src/templates', 'confirm-email.template.ejs'),
        context: {
          first_name: account.profile.first_name,
          confirmUrl,
        },
      })
      .catch((e) => {
        throw new Error(`Error mail sending: ${JSON.stringify(e)}`);
      });
    return 'Email confirmation sent';
  }

  async sendPasswordResetLink(
    account: any,
    //  IUser
  ) {
    const { email, password_hash, role, id } = account;
    const accessToken = await this.jwtService.signAsync({
      id,
      email,
      password_hash,
      role,
    });
    const resetUrl = `${this.configService.get('PASSWORD_RESET_URL')}?token=${accessToken}`;
    await this.mailerService
      .sendMail({
        to: account.email,
        subject: 'Reset password',
        template: resolve('src/templates', 'reset-password.template.ejs'),
        context: {
          first_name: account.profile.first_name,
          resetUrl,
        },
      })
      .catch((e) => {
        throw new Error(`Error mail sending: ${JSON.stringify(e)}`);
      });
    return 'Password reset sent';
  }
}
