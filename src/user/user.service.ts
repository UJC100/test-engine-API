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







@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {}

  async signup(user: SignupDto) {
    const { password, email, role, secretKey } = user;

    const exist = await this.userRepo.findOne({ where: { email } });

    if (exist) {
      throw new HttpException(`User already exist`, HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const tutorSecret = process.env.TUTOR_KEY;
    const AdminSecret = process.env.ADMIN_KEY;

    if (role === 'admin' && AdminSecret === secretKey) {
      //    user.role = Role.tutor
      const createdTutor = this.userRepo.create({
        email,
        password: hashPassword,
        role: Role.admin,
      });
      const saveAdmin = await this.userRepo.save(createdTutor);
      delete createdTutor.password;

      return saveAdmin;
    }
    if (role === 'tutor' && tutorSecret === secretKey) {
      const createdTutor = this.userRepo.create({
        email,
        password: hashPassword,
        role: Role.tutor,
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
    } else {
      throw new UnauthorizedException(`Invalid role or key`);
    }
  }

  async login(userPayload: LoginDto, res: Response) {
    const { email, password } = userPayload;

    const user = await this.userRepo.findOne({ where: { email: email } });
    // console.log(user)

    if (!user) {
      throw new HttpException(`email`, HttpStatus.BAD_REQUEST);
    }

    const userPassword = await bcrypt.compare(password, user.password);

    if (!userPassword) {
      throw new HttpException(`password`, HttpStatus.BAD_REQUEST);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtToken = await this.jwtService.signAsync(payload);

    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      maxAge: 120 * 1000,
    });

    return { message: `login success` };
  }

  async getAllUsers(req: Request) {
    const cookie = req.cookies['jwt'];
    if (!cookie) {
      throw new UnauthorizedException();
    }
    // console.log(req.cookies)
    const verify = await this.jwtService.verifyAsync(cookie);

    if (!verify || verify.role !== 'admin') {
      throw new UnauthorizedException(`Only admins can access this resource`);
    }

    console.log(verify);
    const users = await this.userRepo.find({ relations: ['userProfile'] });

    const allUsers = users.map((user) => {
      return {
        user: user.toResponseObj(), // ADD ADITIONAL LOGIC LIKE THE RESPONSE OBJECT
      };
    });

    return allUsers;
  }

  async getOneUser(id: number, req: Request) {
    // try {
    const cookie = req.cookies['jwt'];

    if (!cookie) {
      throw new UnauthorizedException();
    }

    const verifyJwt = await this.jwtService.verifyAsync(cookie);
    // console.log(verifyJwt)
    if (verifyJwt.role !== 'admin' && verifyJwt.role !== 'tutor') {
      // ADD ADDITIOMAL LOGIC HERE WHEN YOU IMPLEMENT USER PROFILE
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
    const link = `http://localhost:2020/api/v1/user/resetPassword/${userId}/${token}`;
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
    payload: ResetPasswordDto,
    userId: number,
    token: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(`No user found`, HttpStatus.NOT_FOUND);
    }
    //  const secret = process.env.JWT_ENCODE +

    // const secret = process.env
    await this.jwtService.verifyAsync(token);

    const { password, confirmPassword } = payload;

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
