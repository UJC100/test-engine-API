import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizEntity } from 'src/entities/quiz.entity';
import { UserProfile } from 'src/entities/user.profile.entity';
import { PassportModule } from '@nestjs/passport';
import { UserSignup } from 'src/entities/signUp.details';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntity, UserSignup, UserProfile]), PassportModule],
  controllers: [QuizController],
  providers: [QuizService, CacheService],
})
export class QuizModule {}
