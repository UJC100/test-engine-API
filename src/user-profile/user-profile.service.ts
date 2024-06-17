import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileDto } from 'src/user-profile/dto/profile.dto';
import { UpdateProfileDto } from './dto/profile.dto';
import { UserSignup } from 'src/entities/signUp.details';
import { UserProfile } from 'src/entities/user.profile.entity';
import { Role } from 'src/enum/role';
import { Repository } from 'typeorm';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
  ) {}

  async createProfile(payload: ProfileDto, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    console.log('');
    console.log('Coming from Create profile route');
    console.log(user);
    if (!user) {
      throw new UnauthorizedException();
    }
    console.log(user);

    //    user.role = Role.tutor
    const createProfile = this.userProfileRepo.create(payload);
    const Profile = await this.userProfileRepo.save(createProfile);

    return Profile;
  }

  async updateUserProfile(
    payload: UpdateProfileDto,
    userId: string,
    jwtId: string,
  ) {
    const verifyUser = await this.userRepo.findOne({
      where: { id: jwtId },
      relations: ['userProfile'],
    });
    const user = await this.userProfileRepo.findOne({
      where: { id: userId },
      relations: ['signupDetails'],
    });
    // console.log(verifyUser.id, user.signupDetails.id)
    if (verifyUser.id !== user.signupDetails.id) {
      throw new UnauthorizedException();
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.userProfileRepo.update(userId, payload);

    const updatedUser = await this.userProfileRepo.findOne({
      where: { id: userId },
      relations: ['signupDetails'],
    });

    return updatedUser
    ;
  }

  async deleteProfile(profileId: string, userId: string) {
    //  await this.userProfileRepo.delete(profileId)
    const userProfile = await this.userProfileRepo.findOne({
      where: { id: profileId },
      relations: ['signupDetails'],
    });
    const userSignup = await this.userRepo.findOne({ where: { id: userId } });
    const user = userSignup.id;
    const userIdFromProfile = userProfile.signupDetails.id;
    if (user !== userIdFromProfile) {
      throw new ForbiddenException();
    }
    await this.userProfileRepo.delete(userProfile.id);

    return {
      message: 'Profile deleted',
    };
  }
}
