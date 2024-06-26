import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditQuizDto } from './dto/quiz.dto';
import { QuizDto } from 'src/quiz/dto/quiz.dto';
import { QuizEntity } from 'src/entities/quiz.entity';
import { UserSignup } from 'src/entities/signUp.details';
import { UserProfile } from 'src/entities/user.profile.entity';
import { Repository } from 'typeorm';
import { CacheService } from 'src/cache/cache.service';
import { getCachedQuiz } from 'src/helperFunctions/redis';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizEntity)
    private readonly quizRepo: Repository<QuizEntity>,
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
    private readonly redisCache: CacheService
  ) {}

  async setQuiz(userId: string, payload: QuizDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    const userProfileId = user.userProfile.id;
    const userProfile = await this.userProfileRepo.findOne({
      where: { id: userProfileId },
    });

    const userRole = user.role;
    if (userRole !== 'tutor') {
      throw new UnauthorizedException();
    }

    const setQuiz = this.quizRepo.create({
      ...payload,
      userProfile: userProfile,
    });

    const saveQuiz = await this.quizRepo.save(setQuiz);

    return saveQuiz;
  }

  async getAllQuiz(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    const userCourse = user.userProfile.course.toLowerCase();
    const redisKeyName = `GetAllQuiz:${userId}`;
    await getCachedQuiz(this.redisCache, redisKeyName)

    const quizes = await this.quizRepo.find();
     quizes.map((quizes) => {
      let quizCourse = quizes.course.toLowerCase();
      if (user.role === 'admin') {
        return quizes;
      }
      if (userCourse === quizCourse) {
        if(!quizes)  throw new HttpException('No Quiz Found', HttpStatus.NOT_FOUND); 
        return quizes  
      }
     });
    
    await this.redisCache.setCache(redisKeyName, quizes)
    
    return quizes
  }

  async getWeeklyQuiz(userId: string, week: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userProfile'],
    });
    console.log(user.email);
    const course = user.userProfile.course;
    console.log(course);
    if (!course) {
      throw new UnauthorizedException('Please fill in your profile');
    }
    const userCourse = user.userProfile.course.toLowerCase();

    const redisKeyName = `GetWeeklyQuiz:${userId}`;
    await getCachedQuiz(this.redisCache, redisKeyName); 

    const quiz = await this.quizRepo.find({ where: { week } });

    console.log(quiz);

     quiz.filter((quizes) => {
      const quizCourse = quizes.course.toLowerCase();

      if (!quizes) {
        throw new HttpException(
          'No Quiz for this Week Found',
          HttpStatus.NOT_FOUND,
        );
      }

      console.log(quizCourse, userCourse);

      if (userCourse === quizCourse) {
        return quizes;
      }
     });
     
    await this.redisCache.setCache(redisKeyName, quiz)
    
    return quiz
    // const returnedQuiz = [];
    // getQuiz.map((items) => {
    //   if (items !== null) {
    //     returnedQuiz.push(items);
    //   }
    // });
    // if (returnedQuiz.length === 0) {
    //   throw new HttpException('No Quiz Found', HttpStatus.NOT_FOUND);
    // }
    // return returnedQuiz;
  }

  async editQuiz(quizId: string, payload: EditQuizDto, userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    const userRole = user.role;

    if (userRole !== 'tutor') {
      throw new UnauthorizedException('Only tutors can make changes');
    }

    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    const quizCourse = quiz.course;
    const tutorsCourse = user.userProfile.course;

    if (tutorsCourse !== quizCourse) {
      console.log(tutorsCourse + '||' + quizCourse);
      throw new UnauthorizedException();
    }

    await this.quizRepo.update(quizId, payload);

    const editedQuiz = await this.quizRepo.findOne({ where: { id: quizId } });

    return editedQuiz;
  }

  async deleteQuiz(quizId: string, userId: string) {
    //  await this.userProfileRepo.delete(profileId)
    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
      relations: ['userProfile'],
    });
    const userSignup = await this.userRepo.findOne({
      where: { id: userId },
    });
    const userRole = userSignup.role;

    if (userRole !== 'tutor') {
      throw new ForbiddenException();
    }
    await this.quizRepo.delete(quiz.id);

    return {
      message: 'Quiz deleted',
    };
  }
}
