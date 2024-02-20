import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSignup } from 'src/entities/signUp.details';
import { UserProfile } from 'src/entities/user.profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSignup, UserProfile])],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
