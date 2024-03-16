import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizDto } from 'src/dto/quiz.dto';
import { QuizEntity } from 'src/entities/quiz.entity';
import { UserSignup } from 'src/entities/signUp.details';
import { UserProfile } from 'src/entities/user.profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizEntity)
    private readonly quizRepo: Repository<QuizEntity>,
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
  ) {}

  async setQuiz(userId: string, payload: QuizDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userProfile'],
    });
    const userProfileId = user.userProfile.id;
    const findUser = await this.userProfileRepo.findOne({ where: { id: userProfileId } });


    const userRole = user.userProfile.role;
    if (userRole !== 'tutor') {
      throw new UnauthorizedException();
    }

    const setQuiz = this.quizRepo.create({
      ...payload,
      userProfile: findUser.UserProfileResponseObj(),
    });

    const saveQuiz = await this.quizRepo.save(setQuiz);

    return saveQuiz;
  }
}
