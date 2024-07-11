import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemporaryUserTable, UserSignup } from 'src/entities/signUp.details';
import { OtpType } from 'src/enum/otp';
import { UserRoles } from 'src/helperFunctions/userRoles';
import { SignupDto } from 'src/user/dto/user-dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class TemporaryUserService {
  constructor(
    @InjectRepository(TemporaryUserTable)
    private readonly tempUserRepo: Repository<TemporaryUserTable>,
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    private readonly otpService: OtpService,
  ) {}

  async createTemporaryUser(payload: Partial<SignupDto>) {
    const { password, email, role, secretKey, username } = payload;

    const user = await this.userRepo.findOne({ where: { email } });  // IMPLEMENT THIS IN THE USER SERVICE BEFORE SAVING
    if (user) {
      throw new HttpException(`User already exist`, HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(password, 10);

     await UserRoles(
      this.tempUserRepo,
      role,
      secretKey,
      hashPassword,
      email,
      username,
    );

    await this.otpService.sendOtp({
      email,
      username,
      type: OtpType.VERIFY_EMAIL,
    });
    await this.deleteUserAfterTimeOut(email)
      return {
        message: `An otp has been sent to ${email} for verification`
    };
  }

  async deleteUserAfterTimeOut(email: string) {
    setTimeout(async () => {
      const user = await this.tempUserRepo.findOne({ where: { email } });
      try {
        await this.tempUserRepo.delete(user.id);
        console.log(`User:${user.id} was deleted due to uncompleted activity`);
      } catch (error) {
        console.error(`Error deleting OTP for ${user.id}:`, error);
      }
    }, 1800000);  
  }
}
