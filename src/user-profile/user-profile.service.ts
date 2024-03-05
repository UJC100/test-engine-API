import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileDto } from 'src/dto/profile.dto';
import { UserSignup } from 'src/entities/signUp.details';
import { UserProfile } from 'src/entities/user.profile.entity';
import { Role } from 'src/enum/role';
import { Repository } from 'typeorm';

@Injectable()
export class UserProfileService {
    constructor(@InjectRepository(UserProfile) private readonly userProfileRepo: Repository<UserProfile>,
     @InjectRepository(UserSignup) private readonly userRepo: Repository<UserSignup>) { }
    
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
            signupDetails: user,
          role: Role.admin,
        });
        const saveAdmin = await this.userProfileRepo.save(createdAdmin);
        

          return {
            saveAdmin,
            signupDetails: createdAdmin.signupDetails.ProfileResponseObj(),
          };
      }
      if (payload.role === 'tutor' && tutorSecret === payload.secretKey) {
        const createdTutor = this.userProfileRepo.create({
          ...payload,
          signupDetails: user,
          role: Role.tutor,
        });
        const saveTutor = await this.userProfileRepo.save(createdTutor);
       

          return {
            saveTutor,
            signupDetails: createdTutor.signupDetails.ProfileResponseObj(),
          };
      }

      if (payload.role === 'student') {
        const createdUser = this.userProfileRepo.create({
          ...payload,
          signupDetails: user,
          role: Role.student,
        });

      const saveUser = await this.userProfileRepo.save(createdUser);

          return {
            saveUser,
            signupDetails: createdUser.signupDetails.ProfileResponseObj(),
          };
      } else {
        throw new UnauthorizedException(`Invalid role or key`);
      }
    }
}
