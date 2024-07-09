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
import { Repository } from 'typeorm';
import { CacheService } from 'src/cache/cache.service';
import { getCachedQuiz } from 'src/helperFunctions/redis';
import { PaginationService } from 'src/pagination/pagination.service';
import { PaginationDto } from 'src/pagination/dto/pagination-dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizEntity)
    private readonly quizRepo: Repository<QuizEntity>,
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    private readonly redisCache: CacheService,
    private readonly paginationService: PaginationService
  ) {}

  async setQuiz(userId: string, payload: QuizDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    const userRole = user.role;
    if (userRole !== 'tutor') {
      throw new UnauthorizedException();
    }

    const setQuiz = this.quizRepo.create({
      ...payload,
      user
    });

    const saveQuiz = await this.quizRepo.save(setQuiz);

    return saveQuiz;
  }

  async getAllQuiz(userId: string, query: PaginationDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
   
    const redisKeyName = `quizes:page=${query.page}:size=${query.size}:sort=${query.sort}`;
    await getCachedQuiz(this.redisCache, redisKeyName)

    const relations = 'user'
    const quizes = await this.paginationService.paginate(this.quizRepo, query, relations)
     const userQuizes = quizes.data.filter((quizes: any) => {
       if (user.role === 'admin') {
         return quizes;
        }
        const quizCourse = quizes.course.toLowerCase();
        const userCourse = user.course.toLowerCase();
      if (userCourse === quizCourse) {
        if (!quizes) throw new HttpException('No Quiz Found', HttpStatus.NOT_FOUND); 
        return quizes  
       }
       
     });
    
    await this.redisCache.setCache(redisKeyName, userQuizes)
    
    return userQuizes
  }

  async getWeeklyQuiz(userId: string, week: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId }
    });
    console.log(user.email);
    const course = user.course;
    // console.log(course);
    if (!course) {
      throw new UnauthorizedException('Please fill in your profile');
    }
    

    const redisKeyName = `GetWeeklyQuiz:${userId}`;
    await getCachedQuiz(this.redisCache, redisKeyName); 

    const quiz = await this.quizRepo.find({ where: { week } });

     if (quiz.length === 0) {
       throw new HttpException(
         'No Quiz for this Week Found',
         HttpStatus.NOT_FOUND,
       );
     }

    const userWeeklyQuiz = quiz.filter((quizes) => {
      const userCourse = course.toLowerCase();
      const quizCourse = quizes.course.toLowerCase();

      // console.log(quizCourse, userCourse);

      if (userCourse === quizCourse) {
        return quizes;
      }
     });
     
    await this.redisCache.setCache(redisKeyName, quiz)
    
    return userWeeklyQuiz;
   
  }

  async editQuiz(quizId: string, payload: EditQuizDto, userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    const userRole = user.role;

    // if (userRole !== 'tutor') {
    //   throw new UnauthorizedException('Only tutors can make changes');
    // }

    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    // const quizCourse = quiz.course;
    // const tutorsCourse = user.userProfile.course;

    // if (tutorsCourse !== quizCourse) {
    //   console.log(tutorsCourse + '||' + quizCourse);
    //   throw new UnauthorizedException();
    // }

    await this.quizRepo.update(quizId, payload);
    // await this.redisCache.delete('quizes')

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

    // if (userRole !== 'tutor') {
    //   throw new ForbiddenException();
    // }
    await this.quizRepo.delete(quiz.id);

    return {
      message: 'Quiz deleted',
    };
  }
}
