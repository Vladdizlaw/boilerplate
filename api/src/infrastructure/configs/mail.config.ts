import { ConfigService } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export const getMailConfig = async (
  configService: ConfigService,
): Promise<any> => {
  const transport = configService.get<string>('MAIL_TRANSPORT');
  const mailFromName = configService.get<string>('MAIL_FROM_NAME');
  const mailFromAddress = configService.get<string>('MAIL_FROM_ADDRESS');

  return {
    transport,
    defaults: {
      from: `"${mailFromName}" <${mailFromAddress}>`,
    },
    template: {
      adapter: new EjsAdapter(),
      dir: __dirname + '/templates',
      options: {
        strict: false,
      },
    },
  };
};
