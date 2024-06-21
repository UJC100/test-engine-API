import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserProfileModule } from './user-profile/user-profile.module';
import { QuizModule } from './quiz/quiz.module';
import { RedisCacheModule } from './cache/cache.module';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.APP_PASSWORD,
        }
      }
    }),
    DatabaseModule, UserModule, UserProfileModule, QuizModule, RedisCacheModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
