import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class QuizDto {
  @IsNotEmpty()
  @IsString()
  week: string;

  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  questions: string;

  @IsNotEmpty()
  @IsArray()
  options: string[];

  @IsNotEmpty()
  @IsString()
  correctAnswer: string;
}