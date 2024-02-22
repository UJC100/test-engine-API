import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from 'src/dto/signup.dto';
import { UserSignup } from 'src/entities/signUp.details';
import { Repository } from 'typeorm';
import * as bycrpt from 'bcrypt'
import { Role } from 'src/enum/role';
import { ProfileDto } from 'src/dto/profile.dto';
import { LoginDto } from 'src/dto/login.dto';
import { verify } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSignup) private readonly userRepo: Repository<UserSignup>,
    private readonly jwtService: JwtService
  ) { }

    
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

    async login(userPayload: LoginDto) {
      const { email, password } = userPayload
      
      const user = await this.userRepo.findOne({ where: { email: email } });
      // console.log(user)

      if (!user) {
        throw new HttpException(`email`, HttpStatus.BAD_REQUEST)
      }

      const userPassword = await bycrpt.compare(password, user.password)

      if (!userPassword) {
        throw new HttpException(`password`, HttpStatus.BAD_REQUEST);
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role
      }

      const jwtToken = await this.jwtService.signAsync(payload)

      return {token: jwtToken }
  }

  
      async getAllUsers() {
        const users = await this.userRepo.find({ relations: ['userProfile'] });

        const allUsers = users.map(user => {
          return {
            user               // ADD ADITIONAL LOGIC LIKE THE RESPONSE OBJECT
          }
        })

        return allUsers
      }
}
