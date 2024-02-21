import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from 'src/dto/signup.dto';
import { UserSignup } from 'src/entities/signUp.details';
import { Repository } from 'typeorm';
import * as bycrpt from 'bcrypt'
import { Role } from 'src/enum/role';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserSignup) private readonly userRepo: Repository<UserSignup>) { }
    
    async signup(user: SignupDto) {
        const { password, email, role, secretKey} = user
        
        const exist = await this.userRepo.findOne({ where: { email } })
        
        if (exist) {
            throw new HttpException(`User already exist`, HttpStatus.BAD_REQUEST)
        }

        const hashPassword = await bycrpt.hash(password, 10) 
        const tutorSecret = process.env.TUTOR_KEY
        const AdminSecret = process.env.ADMIN_KEY;
    
        if (role === 'admin' && AdminSecret === secretKey) {
                //    user.role = Role.tutor
                 const createdTutor = this.userRepo.create({
                   email,
                     password: hashPassword,
                     role: Role.admin
                 });
                 const saveAdmin = await this.userRepo.save(createdTutor);
                 delete createdTutor.password;

                 return saveAdmin;
        }
        if (role === 'tutor' && tutorSecret === secretKey) {
                 const createdTutor = this.userRepo.create({
                   email,
                     password: hashPassword,
                     role: Role.tutor
                 });
                 const saveAdmin = await this.userRepo.save(createdTutor);
                 delete createdTutor.password;

                 return saveAdmin;
        }

        if (role === 'student') {
               const createdUser = this.userRepo.create({
                 email,
                 password: hashPassword,
               });

               const saveUser = await this.userRepo.save(createdUser);
               delete createdUser.password;

               return saveUser;
        }
        else {
            throw new UnauthorizedException(`Invalid role or key`)
        }
    }

    
}
