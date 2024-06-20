import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from 'src/user/dto/user-dto';
import { UserSignup } from 'src/entities/signUp.details';
import { Repository, UnorderedBulkOperation } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/enum/role';
import { ProfileDto } from 'src/user-profile/dto/profile.dto';
import { LoginDto } from './dto/user-dto';
import { verify } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { Console } from 'console';
import { UpdateLoginDetailsDto } from './dto/user-dto';
import { ForgotPasswordDto } from './dto/user-dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/user-dto';
import { UpdateRefreshTokenDto } from './dto/user-dto';
import { resolve } from 'path';
import { UserRoles } from 'src/helperFunctions/userRoles';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async getTokens(role: string, id: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
          role,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
        },
      ),

      this.jwtService.signAsync(
        {
          id,
          email,
          role,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async getTokensWithoutRoles(id: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN,
        },
      ),

      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async myCustomToken() {
    const token = () => {
      const generateToken = () => {
        const tokenKey =
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const tokenlen = 6;
        let generatedToken = '';

        for (let i = 0; i < tokenlen; i++) {
          generatedToken +=
            tokenKey[Math.floor(Math.random() * tokenKey.length)];
        }
        return generatedToken;
      };

      return new Promise((resolve, reject) => {
        let start = 30;
        let stop = 0;
        let timer = setInterval(() => {
          if (start === stop) {
            clearInterval(timer);
            return {
              message: 'Token expired',
            };
          } else {
            start--;
          }
        }, 1000);

        resolve(generateToken());
      });
    };

    return token();
  }
  //THE ABOVE ARE HELPER
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  async findUserByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }

  async signup(payload: Partial<SignupDto>) {
    const { password, email, role, secretKey, username } = payload;

    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      throw new HttpException(`User already exist`, HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await UserRoles(
      this.userRepo,
      role,
      secretKey,
      hashPassword,
      email,
      username,
    );

    return newUser;
  }

  async login(userPayload: LoginDto, res: Response) {
    const { email, password } = userPayload;

    const thisUser = await this.userRepo.findOne({ where: { email: email } });
    // console.log(thisUser)

    if (!thisUser) {
      throw new HttpException(`email`, HttpStatus.BAD_REQUEST);
    }

    const userPassword = await bcrypt.compare(password, thisUser.password);

    if (!userPassword) {
      throw new HttpException(`password`, HttpStatus.BAD_REQUEST);
    }

    if (!thisUser.userProfile) {
      const jwtTokenWithoutRole = await this.getTokensWithoutRoles(
        thisUser.id,
        thisUser.email,
      );
      const hashedRt = await bcrypt.hash(jwtTokenWithoutRole.refresh_token, 12);
      await this.userRepo.update(thisUser.id, {
        refreshToken: hashedRt,
      });

      res.cookie('jwt', jwtTokenWithoutRole.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      return {
        message: `login success`,
        jwtTokenWithoutRole,
      };
    } else {
      const jwtToken = await this.getTokens(
        thisUser.role,
        thisUser.id,
        thisUser.email,
      );

      //   const { refreshToken }: UpdateRefreshTokenDto = {
      //     refreshToken: jwtToken.refresh_token,
      // };
      const hashedRt = await bcrypt.hash(jwtToken.refresh_token, 12);
      await this.userRepo.update(thisUser.id, {
        refreshToken: hashedRt,
      });
      console.log(
        await this.jwtService.verifyAsync(jwtToken.access_token, {
          secret: process.env.ACCESS_TOKEN_SECRET,
        }),
      );
      console.log(thisUser.refreshToken);

      res.cookie('jwt', jwtToken.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      return {
        message: `login success`,
        jwtToken,
      };
    }
  }

  async getAllUsers(req: Request) {
    const id = req.user["id"]
    const user = await this.userRepo.findOne({ where: { id } });
    console.log(user)

    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException(`Only admins can access this resource`);
    }

    const users = await this.userRepo.find({ relations: ['userProfile'] });
    users.map((allUsers) => {
      return allUsers // ADD ADITIONAL LOGIC LIKE THE RESPONSE OBJECT
    });

    return users;
  }

  async getOneUser(id: string, req: Request) {
    // try {
    const userId = req.user["id"]

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    const userRole = user.role;

    if (userRole !== 'admin') {
      throw new UnauthorizedException(`Only admins can access this resource`);
    }

    const thisUser = await this.userRepo.findOne({
      where: { id },
      relations: ['userProfile'],
    });

    return thisUser;
    // } catch {
    //   // throw new UnauthorizedException()
    // }
  }

  async updateLoginDetails(userPayload: UpdateLoginDetailsDto, req: Request) {
    const { password, ...rest } = userPayload;
 
    const userId = req.user["id"]
    const thisUser = await this.userRepo.findOne({ where: { id: userId } });

    if (!thisUser) {
      throw new UnauthorizedException(`no try am`);
    }

    const checkPassword = await bcrypt.compare(password, thisUser.password);

    if (!checkPassword) {
      throw new UnauthorizedException(`Invalid password`);
    }

    await this.userRepo.update(thisUser.id, {
      ...rest,
    });

    const updatedUser = await this.userRepo.findOne({
      where: { id: thisUser.id },
      relations: ['userProfile'],
    });

    return updatedUser;
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, {
      refreshToken: null,
    });

    return {
      message: 'Logged out',
    };
  }

  async forgotPassword(details: ForgotPasswordDto) {
    const { email } = details;
    const userInfo = await this.userRepo.findOne({
      where: { email },
    });
    if (!userInfo) {
      throw new HttpException(`Incorrect email`, HttpStatus.BAD_REQUEST);
    }
    // console.log(contactInfo.thisUser)
    const userId = userInfo.id;

    const payload = {
      sub: userId,
      email: userInfo.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.FORGOT_PASSWORD_SECRET,
      expiresIn: process.env.FORGOT_PASSWORD_EXPIRES_IN,
    });

    // const myToken = await this.myCustomToken()
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
    console.log(userInfo.email);
    return {
      message: `Link has been sent to your email`,
    };
  }

  async resetPassword(
    details: ResetPasswordDto,
    userId: string,
    token: string,
  ) {
    const thisUser = await this.userRepo.findOne({ where: { id: userId } });
    try {
      if (!thisUser) {
        throw new HttpException(`No thisUser found`, HttpStatus.NOT_FOUND);
      }
      //  const secret = process.env.JWT_ENCODE +

      // const secret = process.env
      await this.jwtService.verifyAsync(token, {
        secret: process.env.FORGOT_PASSWORD_SECRET,
      });

      const { password, confirmPassword } = details;

      if (password !== confirmPassword) {
        throw new HttpException(
          `Passwords don't Match`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      thisUser.password = hashedPassword;

      await this.userRepo.save(thisUser);
      delete thisUser.password;
      return thisUser;
    } catch (error) {
      return error;
    }
  }

  async refreshToken(req: Request) {
    const refreshToken = req.cookies['jwt']
    const decodeRfToken = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    
    const user = await this.userRepo.findOne({ where: { id: decodeRfToken.id } });
    if(!user) throw new HttpException(`Forbidden`, 403);
    const refreshTokenFromDB = user.refreshToken
    const decrypt = await bcrypt.compare(refreshToken, refreshTokenFromDB)
    if (!decrypt) throw new HttpException(`Forbidden`, 403)
  
    const payload = {
            id: user.id,
            email: user.email,
            role: user.role      
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    return {accessToken}
    // if (user.id !== checkJwtAuth.id) throw new HttpException(`Forbidden`, 403)
  
  }
}
