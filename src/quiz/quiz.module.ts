import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizEntity } from 'src/entities/quiz.entity';
import { PassportModule } from '@nestjs/passport';
import { UserSignup } from 'src/entities/signUp.details';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from 'src/cache/cache.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { QuizScore } from 'src/entities/quiz.score';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntity, UserSignup, QuizScore]), PassportModule],
  controllers: [QuizController],
  providers: [QuizService, CacheService, PaginationService],
})
export class QuizModule {}
