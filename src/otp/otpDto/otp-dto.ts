import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { OtpType } from "src/enum/otp";

export class CreateOtpDto{
    @IsEnum(OtpType)
    @IsOptional()
    type: OtpType;

    @IsEmail()
    email: string;

    @IsNumber()
    code: number
}

export class SendOtpDto {
  @IsEnum(OtpType)
  type: OtpType;

  @IsEmail()
  email: string;
    
  @IsString()
  username: string;
}

export class VerifyOtpDto {
  @IsNumber()
  code: number
}