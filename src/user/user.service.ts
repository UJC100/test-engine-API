import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from 'src/dto/signup.dto';
import { UserSignup } from 'src/entities/signUp.details';
import { Repository, UnorderedBulkOperation } from 'typeorm';
import * as bycrpt from 'bcrypt'
import { Role } from 'src/enum/role';
import { ProfileDto } from 'src/dto/profile.dto';
import { LoginDto } from 'src/dto/login.dto';
import { verify } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import {Response, Request} from 'express'
import { Console } from 'console';
import { UpdateLoginDetailsDto } from 'src/dto/update.login.dto';







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

    async login(userPayload: LoginDto, res: Response) {
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

       res.cookie('jwt', jwtToken, {
        httpOnly: true,
        maxAge: 120 * 1000
      })

      return {message: `login success` }
  }

  
  async getAllUsers(req: Request) {

    const cookie = req.cookies['jwt']
    if (!cookie) {
      throw new UnauthorizedException()
    }
        // console.log(req.cookies)
        const verify = await this.jwtService.verifyAsync(cookie)
    
    if (!verify || verify.role !== 'admin') {
       throw new UnauthorizedException(`Only admins can access this resource`)
    } 
       
    console.log(verify)
        const users = await this.userRepo.find({ relations: ['userProfile'] });

        const allUsers = users.map(user => {
          return {
            user : user.toResponseObj()              // ADD ADITIONAL LOGIC LIKE THE RESPONSE OBJECT
          }
        })

        return allUsers
  }
  

  async getOneUser(id: number, req: Request) {
    // try {
       const cookie = req.cookies['jwt'];

       if (!cookie) {
         throw new UnauthorizedException();
       }

    const verifyJwt = await this.jwtService.verifyAsync(cookie);
    // console.log(verifyJwt)
    if (verifyJwt.role !== 'admin' && verifyJwt.role !== 'tutor') {    // ADD ADDITIOMAL LOGIC HERE WHEN YOU IMPLEMENT USER PROFILE
      throw new UnauthorizedException(`Only admins can access this resource`);
    }
    
       const user = await this.userRepo.findOne({
         where: { id },
         relations: ['userProfile'],
       });

       if (!user) {
         throw new HttpException(`User not Found`, HttpStatus.NOT_FOUND);
       }

       return user.toResponseObj();
    // } catch {
    //   // throw new UnauthorizedException()
    // }
   

  }



  async updateLoginDetails(userPayload: UpdateLoginDetailsDto, req: Request) {
    const { password, ...rest } = userPayload;
    const cookie = req.cookies['jwt']
    if (!cookie) {
       throw new UnauthorizedException()
    }
    const verify = await this.jwtService.verifyAsync(cookie)

    const user = await this.userRepo.findOne({ where: { id: verify.sub } });

    if (!user) {
      throw new UnauthorizedException(`no try am`)
    }

    const checkPassword = await bycrpt.compare(password, user.password);

    if (!checkPassword) {
      throw new UnauthorizedException(`Invalid password`)
    }

    await this.userRepo.update(user.id, {
      ...rest
    })

    const updatedUser = await this.userRepo.findOne({ where: { id: user.id }, relations: ['userProfile'] });

    return updatedUser.toResponseObj()

  }

  // async logout(res: Response) {
  //    res.clearCookie('jwt', {
  //     httpOnly: true
  //   })

  //   return {
  //     message : `User logged-out`
  //   }
  // }
}
