import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, OnModuleInit, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './otpEntity/otp-entity';
import { LessThan, LessThanOrEqual, Repository } from 'typeorm';
import * as cron from 'node-cron';
import { CreateOtpDto, SendOtpDto, VerifyOtpDto } from './otpDto/otp-dto';
import { BaseHelper } from 'src/helperFunctions/otpToken';
import { OtpType } from 'src/enum/otp';
import { VerifyEmailTemplate } from 'src/mail/templates/verify-email';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { TemporaryUserTable, UserSignup } from 'src/entities/signUp.details';

@Injectable()
export class OtpService {
    constructor(
        @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
        @InjectRepository(UserSignup) private readonly userRepo: Repository<UserSignup>,
        @InjectRepository(TemporaryUserTable) private readonly tempUserRepo: Repository<TemporaryUserTable>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly mailService: MailService
    ) { }




    async getUsersName(email: string) {
        const user = await this.userRepo.findOne({ where: { email } })
        return user.username
    }


    async createOtp(payload: CreateOtpDto) {
        const otpRecords = await this.otpRepo.findOne({ where: { email: payload.email } });
        if (!otpRecords) {
            const newRecords = this.otpRepo.create(payload)
            await this.otpRepo.save(newRecords)
            const newOtp = await this.otpRepo.findOne({ where: { email: payload.email } });
            await this.deleteOtp(newOtp.id)
            return newRecords
        }
        await this.otpRepo.update(otpRecords.email, payload);
        const updatedOtp = await this.otpRepo.findOne({ where: { email: payload.email } });
        await this.deleteOtp(updatedOtp.id)
        
        return updatedOtp
    }

    async sendOtp(payload: SendOtpDto) {
        const { email, type, username } = payload
    
        const code = BaseHelper.generateToken();

        let template: string;

        switch (type) {
            case OtpType.VERIFY_EMAIL:
                template = VerifyEmailTemplate(code, username)
        }

        const otp = await this.createOtp({
            email, 
            code,
            type
        })
        if (!otp) throw new InternalServerErrorException(`Unable to generate otp. Please try again later`)
        
        await this.mailService.sendMail(email, template)
    }

    async deleteOtp(id: string) {
        setTimeout(async () => {
               try {
                  const otp = await this.otpRepo.findOne({
                    where: { id },
                  });
                  if (!otp)
                    throw new HttpException(
                      'Otp not found',
                      HttpStatus.NOT_FOUND,
                    );

                  await this.otpRepo.delete(id);
                  console.log(`${otp.code} was deleted`);
               } catch (error) {
                console.error(`Error deleting OTP for ${id}:`, error);
               }
           
           }, 60000);
    }
    

    async verifyOtp(payload: VerifyOtpDto) {
        const otp = await this.otpRepo.findOne({ where: { code: payload.code } });
        if (!otp) throw new HttpException('Invalid or expired otp', HttpStatus.NOT_FOUND)
        
        const tempUser = await this.tempUserRepo.findOne({ where: { email: otp.email } });
        if (tempUser) {
            await this.tempUserRepo.delete(tempUser.id)
            await this.userService.signup(tempUser)
            return tempUser
        }
        return 'Invalid otp'
    }
}


