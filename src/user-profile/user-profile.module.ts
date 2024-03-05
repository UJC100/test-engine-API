import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from 'src/entities/user.profile.entity';
import { UserSignup } from 'src/entities/signUp.details';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, UserSignup])], 
  controllers: [UserProfileController],
  providers: [UserProfileService]
})
export class UserProfileModule {}
