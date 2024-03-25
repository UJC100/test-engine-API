import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;


  // @IsString()
  // @IsOptional()
  // secretKey: string;
}