import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditQuizDto } from 'src/dto/editQuiz.dto';
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
      userProfile: findUser.userProfileResponseObj()
    });

    const saveQuiz = await this.quizRepo.save(setQuiz);

    return saveQuiz;
  }


  async getAllQuiz(userId: string) {

    const user = await this.userRepo.findOne({ where: { id: userId } , relations: ['userProfile']});
    const userCourse = user.userProfile.course.toLowerCase()

    const quizes = await this.quizRepo.find()
    const getAllQuiz = quizes.map((quizes) => {
      let quizCourse = quizes.course.toLowerCase();
      if (user.userProfile.role === 'admin') {
        return quizes
      }
      if (userCourse === quizCourse) {
        return {
          quizes
        }
      }
    })
     const returnedQuiz = [];
     getAllQuiz.map((items) => {
       if (items !== null) {
         returnedQuiz.push(items);
       }
     });
     if (returnedQuiz.length === 0) {
       throw new HttpException('No Quiz Found', HttpStatus.NOT_FOUND);
     }

    return returnedQuiz
  }

  async getWeeklyQuiz( userId: string, week: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['userProfile'] });
    const getRole = user.userProfile
    if (!getRole) {
      throw new UnauthorizedException('Please fill in your profile')
    }
    const userCourse = user.userProfile.course.toLowerCase()

    const quiz = await this.quizRepo.find({ where: { week } });
    console.log(quiz)

    const getQuiz = quiz.filter(quizes => {
      const quizCourse = quizes.course.toLowerCase()

       if (!quizes) {
         throw new HttpException('No Quiz for this Week Found', HttpStatus.NOT_FOUND);
      }
      
      console.log(quizCourse, userCourse)
    
      if (userCourse === quizCourse) {
        return quizes 
      }

    })
    const returnedQuiz = []
    getQuiz.map(items => {
      if (items !== null) {
        returnedQuiz.push(items)
      }
    })
    if (returnedQuiz.length === 0) {
      throw new HttpException('No Quiz Found', HttpStatus.NOT_FOUND,);
    }
    return returnedQuiz

  }

  async editQuiz(quizId: string, payload: EditQuizDto, userId: string) {
    
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['userProfile']});
    const userRole = user.userProfile.role

    if (userRole !== 'tutor') {
      throw new UnauthorizedException('Only tutors can make changes')
    }

    await this.quizRepo.update(quizId, payload)
    
    const editedQuiz = await this.quizRepo.findOne({ where: { id: quizId } });

    return editedQuiz
  }
}
