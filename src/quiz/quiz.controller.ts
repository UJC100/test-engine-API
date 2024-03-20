import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizDto } from 'src/dto/quiz.dto';
import { User } from 'src/custome-decorators/user.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/jwt.guard';
import { EditQuizDto } from 'src/dto/editQuiz.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('setQuiz')
  @UseGuards(JwtAuthGuard)
  async setQuiz(@Body() payload: QuizDto, @User('id') userId: string) {
    return await this.quizService.setQuiz(userId, payload);
  }

  @Get('getAllQuizes')
  @UseGuards(JwtAuthGuard)
  async getAllQuizes(@User('id') userId: string) {
    return await this.quizService.getAllQuiz(userId);
  }

  @Get('getQuiz/:week')
  @UseGuards(JwtAuthGuard)
  async getWeeklyQuiz(@User('id') userId: string, @Param('week') week: string) {
    const weekUrl = week.replace(/\+/g, ' '); // FOR ENTERING INPUTS WITH SPACES. eg "week 1"
    return await this.quizService.getWeeklyQuiz(userId, weekUrl);
  }

  @Patch('editQuiz/:id')
  @UseGuards(JwtAuthGuard)
  async editQuiz(@Param('id') quizId: string, @Body() payload: EditQuizDto, @User('id') userId: string) {
    return await this.quizService.editQuiz(quizId, payload, userId);
  }
}
