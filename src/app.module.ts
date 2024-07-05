import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { QuizModule } from './quiz/quiz.module';
import { RedisCacheModule } from './cache/cache.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { join } from 'path';
import { TemporaryUserModule } from './temporary-user/temporary-user.module';
import { PaginationModule } from './pagination/pagination.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    DatabaseModule,
    UserModule,
    QuizModule,
    RedisCacheModule,
    MailModule,
    OtpModule,
    TemporaryUserModule,
    PaginationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
