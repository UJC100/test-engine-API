import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizEntity } from '../entities/quiz.entity';
import { PassportModule } from '@nestjs/passport';
import { UserSignup } from '../entities/signUp.details';
import { CacheService } from '../cache/cache.service';
import { PaginationService } from '../pagination/pagination.service';
import { QuizScore } from '../entities/quiz.score';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntity, UserSignup, QuizScore]), PassportModule],
  controllers: [QuizController],
  providers: [QuizService, CacheService, PaginationService],
})
export class QuizModule {}
