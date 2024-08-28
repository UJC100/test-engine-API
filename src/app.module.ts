import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { DatabaseModule } from './database/database.module';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { RedisCacheModule } from './cache/cache.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { TemporaryUserModule } from './temporary-user/temporary-user.module';
import { PaginationModule } from './pagination/pagination.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    DatabaseModule,
    UserModule,
    QuizModule,
    RedisCacheModule,
    MailModule,
    OtpModule,
    TemporaryUserModule,
    PaginationModule,
    RateLimiterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
