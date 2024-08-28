import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSignup } from '../entities/signUp.details';
import { JwtSrategy } from '../jwt-auth/jwt.strategy';
import { GoogleStrategy } from '../googleAuth/googleStrategy';
import { GoogleUserController } from './google.user.controller';
import { CacheService } from '../cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OtpModule } from '../otp/otp.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PaginationService } from '../pagination/pagination.service';
import { QuizModule } from 'src/quiz/quiz.module';
import { QuizScore } from '../entities/quiz.score';
import { MailService } from '../mail/mail.service';
// import { RefreshTokenStrategy } from 'src/jwt-auth/refreshToken';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSignup, QuizScore]),
    PassportModule,
    forwardRef(() => OtpModule),
  ],
  providers: [UserService, JwtSrategy, GoogleStrategy, CacheService, PaginationService, MailService],
  controllers: [UserController, GoogleUserController],
  exports: [UserService]
})
export class UserModule {}
