import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSignup } from '../entities/signUp.details';
import { UserProfile } from '../entities/user.profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtSrategy } from '../jwt-auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: {
          algorithm: configService.getOrThrow('ALGORITHM'),
          expiresIn: configService.getOrThrow('EXPIRESIN'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserSignup, UserProfile]),
    PassportModule
  ],
  providers: [UserService, JwtSrategy],
  controllers: [UserController],
})
export class UserModule {}
