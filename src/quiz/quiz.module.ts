import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizEntity } from 'src/entities/quiz.entity';
import { UserProfile } from 'src/entities/user.profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntity, UserProfile])],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
