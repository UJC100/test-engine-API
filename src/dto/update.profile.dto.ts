import { IsOptional, IsString } from "class-validator";

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