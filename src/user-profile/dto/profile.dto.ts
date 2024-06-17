import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProfileDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  course: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  course: string;
}