import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, OnModuleInit, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './otpEntity/otp-entity';
import { LessThan, LessThanOrEqual, Repository } from 'typeorm';
import * as cron from 'node-cron';
import { CreateOtpDto, SendOtpDto } from './otpDto/otp-dto';
import { BaseHelper } from 'src/helperFunctions/otpToken';
import { OtpType } from 'src/enum/otp';
import { VerifyEmailTemplate } from 'src/mail/templates/verify-email';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { UserSignup } from 'src/entities/signUp.details';

@Injectable()
export class OtpService {
    constructor(
        @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
        private readonly mailService: MailService,
        @InjectRepository(UserSignup) private readonly userService: Repository<UserSignup>
    ) { }




    async getUsersName(email: string) {
        const user = await this.userService.findOne({ where: { email } })
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
    
}


export class CleanUpService implements OnModuleInit{
    constructor(@InjectRepository(Otp) private readonly otpRepo: Repository<Otp>) { }
    
    onModuleInit() {
        cron.schedule('*/5****', async () => {
            const expirationDate = new Date(Date.now() - 300 * 1000);
            await this.otpRepo.delete({
                createdAt: LessThanOrEqual(expirationDate)
            })
        })
    }
}