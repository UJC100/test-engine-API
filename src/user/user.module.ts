import { Module } from '@nestjs/common';
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
  ],
  providers: [UserService, JwtSrategy, GoogleStrategy],
  controllers: [UserController, GoogleUserController],
})
export class UserModule {}
