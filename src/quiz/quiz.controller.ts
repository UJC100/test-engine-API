import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { QuizService } from './quiz.service';
import { QuizDto, quizScoreDto } from '../quiz/dto/quiz.dto';
import { User } from '../custome-decorators/user.decorator';
import { JwtAuthGuard } from '../jwt-auth/jwt.guard';
import { EditQuizDto } from './dto/quiz.dto';
import { PaginationDto } from '../pagination/dto/pagination-dto';

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
  async getAllQuizes(
    @User('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return await this.quizService.getAllQuiz(userId, query);
  }

  @Get('getQuiz/:week')
  @UseGuards(JwtAuthGuard)
  async getWeeklyQuiz(@User('id') userId: string, @Param('week') week: string) {
    const weekUrl = week.replace(/\+/g, ' '); // FOR ENTERING INPUTS WITH SPACES. eg "week+1 will become week 1"
    return await this.quizService.getWeeklyQuiz(userId, weekUrl);
  }

  @Post('quizScore/:week')
  @UseGuards(JwtAuthGuard)
  async quizScore(
    @Body() payload: quizScoreDto,
    @Param('week') week: string,
    @User('id') userId: string,
  ) {
    const weekUrl = week.replace(/\+/g, ' ');
    return await this.quizService.quizScore(payload, weekUrl, userId);
  }

  @Patch('editQuiz/:id')
  @UseGuards(JwtAuthGuard)
  async editQuiz(
    @Param('id') quizId: string,
    @Body() payload: EditQuizDto,
    @User('id') userId: string,
  ) {
    return await this.quizService.editQuiz(quizId, payload, userId);
  }

  @Delete('deleteQuiz/:id')
  @UseGuards(JwtAuthGuard)
  async deleteQuiz(@Param('id') quizId: string, @User('id') userId: string) {
    return await this.quizService.deleteQuiz(quizId, userId);
  }
}
