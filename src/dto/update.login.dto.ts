import { IsNotEmpty, IsOptional, IsString } from "class-validator";

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