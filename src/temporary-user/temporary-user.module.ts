import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemporaryUserController } from './temporary-user.controller';
import { TemporaryUserService } from './temporary-user.service';
import { TemporaryUserTable, UserSignup } from '../entities/signUp.details';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([TemporaryUserTable, UserSignup]), OtpModule],
  controllers: [TemporaryUserController],
  providers: [TemporaryUserService], 
  exports: [TemporaryUserService]
})
export class TemporaryUserModule {}
