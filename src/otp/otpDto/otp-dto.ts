import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmailType } from '../../enum/email-enum';

export class CreateOtpDto {
  @IsEnum(EmailType)
  @IsOptional()
  type: EmailType;

  @IsEmail()
  email: string;

  @IsNumber()
  code: number;
}

export class SendOtpDto {
  @IsEnum(EmailType)
  type: EmailType;

  @IsEmail()
  email: string;

  @IsString()
  username: string;
}

export class VerifyOtpDto {
  @IsNumber()
  code: number;
}
