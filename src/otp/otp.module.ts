import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './otpEntity/otp-entity';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { UserSignup } from 'src/entities/signUp.details';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, UserSignup]), MailModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService]
})
export class OtpModule {}
