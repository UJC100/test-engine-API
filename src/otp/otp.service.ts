import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from '../entities/otp-entity';
import { LessThan, LessThanOrEqual, Repository } from 'typeorm';
import * as cron from 'node-cron';
import { CreateOtpDto, SendOtpDto, VerifyOtpDto } from './otpDto/otp-dto';
import { BaseHelper } from '../helperFunctions/otpToken';
import { EmailSubjectType, EmailType } from '../enum/email-enum';
import { VerifyEmailTemplate } from '../mail/templates/verify-email';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { TemporaryUserTable, UserSignup } from '../entities/signUp.details';
import { WelcomeEmailTemplate } from '../mail/templates/welcome-email';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    @InjectRepository(TemporaryUserTable)
    private readonly tempUserRepo: Repository<TemporaryUserTable>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async getUsersName(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    return user.username;
  }

  async createOtp(payload: CreateOtpDto) {
    const otpRecords = await this.otpRepo.findOne({
      where: { email: payload.email },
    });

    if (!otpRecords) {
      const newRecords = this.otpRepo.create(payload);
      await this.otpRepo.save(newRecords);
      const newOtp = await this.otpRepo.findOne({
        where: { email: payload.email },
      });
      await this.deleteOtp(newOtp.id, 'set');
      return newRecords;
    }
    await this.deleteOtp(otpRecords.id, 'clear');
    await this.otpRepo.update(otpRecords.id, payload);
    const updatedOtp = await this.otpRepo.findOne({
      where: { email: payload.email },
    });
    await this.deleteOtp(updatedOtp.id, 'set');

    return updatedOtp;
  }

  async sendOtp(payload: SendOtpDto) {
    const { email, type, username } = payload;

    const code = BaseHelper.generateToken();

    let template: string;
    let subject: string;

    switch (type) {
      case EmailType.VERIFY_EMAIL:
        template = VerifyEmailTemplate(code, username);
        subject = EmailSubjectType.VERIFY_EMAIL;
    }

    const otp = await this.createOtp({
      email,
      code,
      type,
    });
    if (!otp)
      throw new InternalServerErrorException(
        `Unable to generate otp. Please try again later`,
      );

    await this.mailService.sendMail(email, template, subject);
  }

  async deleteOtp(id: string, query: string) {
    let timerId: any;
    if (query === 'set') {
      timerId = setTimeout(async () => {
        try {
          const otp = await this.otpRepo.findOne({
            where: { id },
          });
          if (!otp)
            throw new HttpException('Otp not found', HttpStatus.NOT_FOUND);

          await this.otpRepo.delete(id);
          console.log(`${otp.code} was deleted`);
        } catch (error) {
          console.error(`Error deleting OTP for ${id}:`, error);
        }
      }, 1000);
      return timerId;
    } else if (query === 'clear') {
      clearTimeout(timerId);
      console.log(`Timer was restarted`);
    }
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const otp = await this.otpRepo.findOne({ where: { code: payload.code } });
    if (!otp)
      throw new HttpException('Invalid or expired otp', HttpStatus.NOT_FOUND);

    const tempUser = await this.tempUserRepo.findOne({
      where: { email: otp.email },
    });
    const template = WelcomeEmailTemplate(tempUser.username);
    const subject = EmailSubjectType.WELCOME_EMAIL;
    if (tempUser) {
      await this.mailService.sendMail(tempUser.email, template, subject);
      await this.tempUserRepo.delete(tempUser.id);
      await this.userService.signup(tempUser);
      return tempUser;
    }
    return 'Invalid otp';
  }

  async resendOtp(id: string) {
    const userInTempDb = await this.tempUserRepo.findOne({ where: { id } });
    if (!userInTempDb)
      throw new HttpException('Session expired.', HttpStatus.UNAUTHORIZED);

    await this.sendOtp({
      username: userInTempDb.username,
      email: userInTempDb.email,
      type: EmailType.VERIFY_EMAIL,
    });

    return {
      message: `New otp has been sent to ${userInTempDb.email}`,
    };
  }
}
