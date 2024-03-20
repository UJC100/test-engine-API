import { IsNotEmpty, IsString, IsArray } from "class-validator";

export class EditQuizDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsArray()
  options: string[];

  @IsNotEmpty()
  @IsString()
  correctAnswer: string;
}