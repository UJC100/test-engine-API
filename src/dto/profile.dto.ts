import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProfileDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  secretKey: string;
}