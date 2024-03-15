import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizDto } from 'src/dto/quiz.dto';
import { QuizEntity } from 'src/entities/quiz.entity';
import { UserProfile } from 'src/entities/user.profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizService {
    constructor(
        @InjectRepository(QuizEntity) private readonly quizRepo: Repository<QuizEntity>,
        @InjectRepository(UserProfile) private readonly userRepo: Repository<UserProfile>
    
    ) { }
    
    async setQuiz(userId: string, payload: QuizDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } })
        const userRole = user.role
        console.log(userRole)

        if (userRole !== 'tutor') {
            throw new UnauthorizedException();
        }

        const setQuiz = this.quizRepo.create({
            ...payload,
               userProfile: user.UserProfileResponseObj()
        })

        const saveQuiz = await this.quizRepo.save(setQuiz)

        return saveQuiz
    }
}
