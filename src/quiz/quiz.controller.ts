import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizDto } from 'src/dto/quiz.dto';
import { User } from 'src/utils/user.decorator';
import { JwtSrategy } from 'src/jwt-auth/jwt.strategy';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtSrategy)
  async setQuiz(@Body() payload: QuizDto, @User('id') userId: string) {
    return await this.quizService.setQuiz(userId, payload);
  }
}
