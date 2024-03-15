import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from 'src/dto/signup.dto';
import { UserSignup } from 'src/entities/signUp.details';
import { Repository, UnorderedBulkOperation } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { Role } from 'src/enum/role';
import { ProfileDto } from 'src/dto/profile.dto';
import { LoginDto } from 'src/dto/login.dto';
import { verify } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import {Response, Request} from 'express'
import { Console } from 'console';
import { UpdateLoginDetailsDto } from 'src/dto/update.login.dto';
import { ForgotPasswordDto } from 'src/dto/forgotPassword.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';
import { GoogleUserDto } from 'src/dto/google.signup.dto';
import { GoogleUser } from 'src/entities/google.entity';







@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSignup) private readonly userRepo: Repository<UserSignup>,
    @InjectRepository(GoogleUser) private readonly googleUserRepo: Repository<GoogleUser>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {}

  async signup(user: SignupDto) {
    const { password, email } = user;

    const exist = await this.userRepo.findOne({ where: { email } });

    if (exist) {
      throw new HttpException(`User already exist`, HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const createUser = this.userRepo.create({
      password: hashPassword,
      email
    })

    const saveUser = await this.userRepo.save(createUser)
    delete saveUser.password

    return saveUser



  }

  async login(userPayload: LoginDto, res: Response) {
    const { email, password } = userPayload;

    const user = await this.userRepo.findOne({ where: { email: email }, relations: ['userProfile'] });
    // console.log(user)

    if (!user) {
      throw new HttpException(`email`, HttpStatus.BAD_REQUEST);
    }

    const userPassword = await bcrypt.compare(password, user.password);

    if (!userPassword) {
      throw new HttpException(`password`, HttpStatus.BAD_REQUEST);
    }

    const details = {
      sub: user.id,
      email: user.email,
      role: user.userProfile.role,
    };

    const jwtToken = await this.jwtService.signAsync(details);

    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    return {
      message: `login success`,
      jwtToken
    };
  }

  async googleSignup(userDetails: GoogleUserDto) {
    
    const verifyUser = await this.googleUserRepo.findOne({ where: { email: userDetails.email } })
    if (verifyUser) return verifyUser
    
    const createUser = this.googleUserRepo.create(userDetails)
     await this.googleUserRepo.save(createUser)

    const user = await this.googleUserRepo.findOne({ where: { email: userDetails.email }, relations: ['userProfile']})
    
    const payload = {
      sub: user.id,
      email: user.email
    }
    const token = await this.jwtService.signAsync(payload)

    return {
      message: 'login Success',
      token
    }
  }

  async getAllUsers(req: Request) {
    const cookie = req.cookies['jwt'];
    if (!cookie) {
      throw new UnauthorizedException();
    }
    // console.log(req.cookies)
    const verify = await this.jwtService.verifyAsync(cookie);

    // if (!verify || verify.role !== 'admin') {
    //   throw new UnauthorizedException(`Only admins can access this resource`);
    // }

    console.log(verify);
    const users = await this.userRepo.find({ relations: ['userProfile'] });

    const allUsers = users.map((user) => {
      return {
        user: user.toResponseObj(), // ADD ADITIONAL LOGIC LIKE THE RESPONSE OBJECT
      };
    });

    return allUsers;
  }

  async getOneUser(id: string, req: Request) {
    // try {
    const cookie = req.cookies['jwt'];

    if (!cookie) {
      throw new UnauthorizedException();
    }

    const verifyJwt = await this.jwtService.verifyAsync(cookie);
    // console.log(verifyJwt)
    // if (verifyJwt.role !== 'admin' && verifyJwt.role !== 'tutor') {
    //   // ADD ADDITIOMAL LOGIC HERE WHEN YOU IMPLEMENT USER PROFILE
    //   throw new UnauthorizedException(`Only admins can access this resource`);
    // }


    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['userProfile'],
    });

    const userRole = user.userProfile.role
    if (!user) {
      throw new HttpException(`User not Found`, HttpStatus.NOT_FOUND);
    }
    if (userRole !== 'admin') {
      throw new UnauthorizedException(`Only admins can access this resource`);
    }

    return user.toResponseObj();
    // } catch {
    //   // throw new UnauthorizedException()
    // }
  }

  async updateLoginDetails(userPayload: UpdateLoginDetailsDto, req: Request) {
    const { password, ...rest } = userPayload;
    const cookie = req.cookies['jwt'];
    if (!cookie) {
      throw new UnauthorizedException();
    }
    const verify = await this.jwtService.verifyAsync(cookie);

    const user = await this.userRepo.findOne({ where: { id: verify.sub } });

    if (!user) {
      throw new UnauthorizedException(`no try am`);
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      throw new UnauthorizedException(`Invalid password`);
    }

    await this.userRepo.update(user.id, {
      ...rest,
    });

    const updatedUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['userProfile'],
    });

    return updatedUser.toResponseObj();
  }

  // async logout(res: Response) {
  //    res.clearCookie('jwt', {
  //     httpOnly: true
  //   })

  //   return {
  //     message : `User logged-out`
  //   }
  // }

  async forgotPassword(details: ForgotPasswordDto) {
    const { email } = details;
    const userInfo = await this.userRepo.findOne({
      where: { email }
    });
    if (!userInfo) {
      throw new HttpException(`Incorrect email`, HttpStatus.BAD_REQUEST);
    }
    // console.log(contactInfo.user)
    const userId = userInfo.id;

    const payload = {
      sub: userId,
      email: userInfo.email,
    };

    const expiration = {
      expiresIn: '5m',
    };

    const token = await this.jwtService.signAsync(payload, expiration);
    const link = `http://localhost:2021/user/resetPassword/${userId}/${token}`;
    try {
      await this.mailerService.sendMail({
        to: `${userInfo.email}`,
        from: `${process.env.MAILER_USER}`,
        subject: `Reset Password link`,
        text: `click the link to reset password`,
        html: `<h1><b>Click the link to change password</b></h1><br><a href= "${link}">reset your password</a>`,
      });
    } catch (error) {
      throw error;
    }

    console.log(link);
    return `Link has been sent to email`;
  }

  async resetPassword(
    details: ResetPasswordDto,
    userId: string,
    token: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(`No user found`, HttpStatus.NOT_FOUND);
    }
    //  const secret = process.env.JWT_ENCODE +

    // const secret = process.env
    await this.jwtService.verifyAsync(token);

    const { password, confirmPassword } = details;

    if (password !== confirmPassword) {
      throw new HttpException(`Passwords don't Match`, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    await this.userRepo.save(user);
    delete user.password;
    return user;
  }
}
