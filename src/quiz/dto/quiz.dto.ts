import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class QuizDto {
  @IsNotEmpty()
  @IsString()
  week: string;

  @IsNotEmpty()
  @IsString()
  course: string;

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



export class quizScoreDto {

  @IsNumber()
  score: number;
  
}



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