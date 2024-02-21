import { IsNotEmpty, IsString } from "class-validator";

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
}