import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSignup } from '../entities/signUp.details';
import { UserProfile } from '../entities/user.profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtSrategy } from '../jwt-auth/jwt.strategy';
import { GoogleStrategy } from 'src/googleAuth/googleStrategy';
import { GoogleUserController } from './google.user.controller';
import { CacheService } from 'src/cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OtpModule } from 'src/otp/otp.module';
// import { RefreshTokenStrategy } from 'src/jwt-auth/refreshToken';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSignup, UserProfile]),
    PassportModule,
   forwardRef(() => OtpModule)
  ],
  providers: [UserService, JwtSrategy, GoogleStrategy, CacheService],
  controllers: [UserController, GoogleUserController],
  exports: [UserService]
})
export class UserModule {}
