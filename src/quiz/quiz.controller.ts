import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizDto } from 'src/dto/quiz.dto';
import { User } from 'src/custome-decorators/user.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/jwt.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('setQuiz')
  @UseGuards(JwtAuthGuard)
  async setQuiz(@Body() payload: QuizDto, @User('id') userId: string) {
    return await this.quizService.setQuiz(userId, payload);
  }
}
