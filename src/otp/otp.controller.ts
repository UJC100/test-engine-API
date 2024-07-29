import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './otpDto/otp-dto';


@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService){}

    @Post('verify')
        @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() code: VerifyOtpDto) {
        return await this.otpService.verifyOtp(code)
    }

    @Get('resendOtp/:id')
    async resendOtp(@Param('id') id: string) {
        return await this.otpService.resendOtp(id)
    }

}
