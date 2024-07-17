import { Module, forwardRef } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from '../entities/otp-entity';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { TemporaryUserTable, UserSignup } from 'src/entities/signUp.details';
import { TemporaryUserModule } from 'src/temporary-user/temporary-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, UserSignup, TemporaryUserTable]),
    MailModule,
    forwardRef(() => UserModule),
  ],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
