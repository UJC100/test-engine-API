import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './otpDto/otp-dto';

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService){}

    @Post('verify')
    async verifyOtp(@Body() code: VerifyOtpDto) {
        return await this.otpService.verifyOtp(code)
    }

}
