import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';


@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: process.env.MAILER_SERVICE,
        host: process.env.MAILER_HOST,
        port: +process.env.MAILER_PORT,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
        socketTimeout: 5 * 60 * 1000,
        connectionTimeout: 5 * 60 * 1000,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },

      defaults: {
        from: `${process.env.MAILER_EMAIL}`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
