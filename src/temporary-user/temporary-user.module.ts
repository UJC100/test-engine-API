import { Module } from '@nestjs/common';
import { TemporaryUserController } from './temporary-user.controller';
import { TemporaryUserService } from './temporary-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemporaryUserTable, UserSignup } from 'src/entities/signUp.details';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([TemporaryUserTable, UserSignup]), OtpModule],
  controllers: [TemporaryUserController],
  providers: [TemporaryUserService], 
  exports: [TemporaryUserService]
})
export class TemporaryUserModule {}
