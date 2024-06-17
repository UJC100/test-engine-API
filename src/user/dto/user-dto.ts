import { IsBoolean, IsNotEmpty, IsOptional, IsString, isBoolean } from "class-validator";
import { Role } from "src/enum/role";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  username: string;

  @IsString()
  role: string

  @IsString()
  @IsOptional()
  secretKey: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateLoginDetailsDto {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  //   @IsOptional()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

export class UpdateRefreshTokenDto {
  @IsString()
  refreshToken: string;
}