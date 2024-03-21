import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileDto } from 'src/dto/profile.dto';
import { UpdateProfileDto } from 'src/dto/update.profile.dto';
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

    if (!user) {
      throw new UnauthorizedException();
    }

    const tutorSecret = process.env.TUTOR_KEY;
    const AdminSecret = process.env.ADMIN_KEY;

    if (payload.role === 'admin' && AdminSecret === payload.secretKey) {
      //    user.role = Role.tutor
      const createdAdmin = this.userProfileRepo.create({
        ...payload,
        signupDetails: user.ProfileResponseObj(),
        role: Role.admin,
      });
      const saveAdmin = await this.userProfileRepo.save(createdAdmin);

      return {
        saveAdmin,
      };
    }
    if (payload.role === 'tutor' && tutorSecret === payload.secretKey) {
      const createdTutor = this.userProfileRepo.create({
        ...payload,
        signupDetails: user.ProfileResponseObj(),
        role: Role.tutor,
      });
      const saveTutor = await this.userProfileRepo.save(createdTutor);

      return {
        saveTutor,
      };
    }

    if (payload.role === 'student') {
      const createdUser = this.userProfileRepo.create({
        ...payload,
        signupDetails: user.ProfileResponseObj(),
        role: Role.student,
      });

      const saveUser = await this.userProfileRepo.save(createdUser);

      return {
        saveUser,
      };
    } else {
      throw new UnauthorizedException(`Invalid role or key`);
    }
  }

  async updateUserProfile(payload: UpdateProfileDto, userId: string, jwtId: string) {
    const verifyUser = await this.userRepo.findOne({ where: { id: jwtId } , relations: ['userProfile']})
    const user = await this.userProfileRepo.findOne({
      where: { id: userId },
      relations: ['signupDetails'],
    });
    console.log(verifyUser.id, user.signupDetails.id)
    if (verifyUser.id !== user.signupDetails.id) {
      throw new UnauthorizedException()
    }
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.userProfileRepo.update(userId, payload);

    const updatedUser = await this.userProfileRepo.findOne({
      where: { id: userId },
      relations: ['signupDetails'],
    });

    return {
      ...updatedUser,
      signupDetails: updatedUser.signupDetails.ProfileResponseObj()
    };
  }

  async deleteProfile(profileId: string, userId: string) {
    //  await this.userProfileRepo.delete(profileId)
    const userProfile = await this.userProfileRepo.findOne({ where: { id: profileId }, relations: ['signupDetails'] });
    const userSignup = await this.userRepo.findOne({ where: { id: userId } });
    const user = userSignup.id
    const userIdFromProfile = userProfile.signupDetails.id
    if (user !== userIdFromProfile) {
      throw new ForbiddenException()
    }
    await this.userProfileRepo.delete(userProfile.id)

    return {
      message: 'Profile deleted'
    }
  }
}
