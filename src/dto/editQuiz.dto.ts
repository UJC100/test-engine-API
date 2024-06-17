import { IsNotEmpty, IsString, IsArray, IsOptional } from "class-validator";

export class EditQuizDto {
  @IsOptional()
  @IsString()
  question: string;

  @IsOptional()
  @IsArray()
  options: string[];
  
  @IsOptional()
  @IsString()
  correctAnswer: string;
}