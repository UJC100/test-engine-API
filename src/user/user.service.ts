import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UnorderedBulkOperation } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { Response, Request } from 'express';
import { SignupDto } from 'src/user/dto/user-dto';
import { UserSignup } from '../entities/signUp.details';
import { Role } from 'src/enum/role';
import { LoginDto } from './dto/user-dto';
import { UpdateUserDetailsDto } from './dto/user-dto';
import { ForgotPasswordDto } from './dto/user-dto';
import { ResetPasswordDto } from './dto/user-dto';
import { UpdateRefreshTokenDto } from './dto/user-dto';
import { UserRoles } from 'src/helperFunctions/userRoles';
// import { RedisCache } from 'src/helperFunctions/redis';
import { CacheService } from '../cache/cache.service';
import { OtpService } from 'src/otp/otp.service';
import { EmailSubjectType, EmailType } from '../enum/email-enum';
import { getCachedQuiz } from '../helperFunctions/redis';
import { PaginationService } from '../pagination/pagination.service';
import { PaginationDto } from '../pagination/dto/pagination-dto';
import { QuizScore } from '../entities/quiz.score';
import { MailService } from '../mail/mail.service';
import { ForgotPassword } from '../mail/templates/forgot-password';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserSignup)
    private readonly userRepo: Repository<UserSignup>,
    @InjectRepository(QuizScore)
    private readonly quizScoreRepo: Repository<QuizScore>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly redisChache: CacheService,
    private readonly paginationService: PaginationService,
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

  //THE ABOVE ARE HELPER
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  async findUserByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }

  async signup(payload: any) {
    const user = this.userRepo.create(payload);
    await this.userRepo.save(user);
    return user;
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

    const jwtToken = await this.getTokens(
      thisUser.role,
      thisUser.id,
      thisUser.email,
    );

    const hashedRt = await bcrypt.hash(jwtToken.refresh_token, 12);
    await this.userRepo.update(thisUser.id, {
      refreshToken: hashedRt,
    });
    // console.log(
    //   await this.jwtService.verifyAsync(jwtToken.access_token, {
    //     secret: process.env.ACCESS_TOKEN_SECRET,
    //   }),
    // );
    // console.log(thisUser.refreshToken);

    res.cookie('jwt', jwtToken.refresh_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    return {
      message: `login success`,
      jwtToken,
    };
  }

  async getAllUsers(req: Request, query: PaginationDto) {
    const id = req.user['id'];
    const redisKeyName = `users:page=${query.page}:size=${query.size}:sort=${query.sort}:userId=${id}`;
    await getCachedQuiz(this.redisChache, redisKeyName);

    const user = await this.userRepo.findOne({ where: { id } });
    // console.log(user);

    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException(`Only admins can access this resource`);
    }

    // const users = await this.userRepo.find({ relations: ['userProfile'] });
    const relations = ['score', 'quizes'];
    const users = await this.paginationService.paginate(
      this.userRepo,
      query,
      relations,
    );

    await this.redisChache.setCache(redisKeyName, users);

    return users;
  }

  async getOneUser(id: string, req: Request) {
    // try {
    const userId = req.user['id'];

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    const userRole = user.role;

    if (userRole !== 'admin') {
      throw new UnauthorizedException(`Only admins can access this resource`);
    }

    const redisKeyName = `GetUser:${userId}`;
    await getCachedQuiz(this.redisChache, redisKeyName);
    const thisUser = await this.userRepo.findOne({
      where: { id },
    });

    await this.redisChache.setCache(redisKeyName, thisUser);
    return thisUser;
    // } catch {
    //   // throw new UnauthorizedException()
    // }
  }

  async updateUserDetails(userPayload: UpdateUserDetailsDto, req: Request) {
    const { password, ...rest } = userPayload;

    const userId = req.user['id'];
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
      relations: [],
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
    
    const template = ForgotPassword(link)
    const subject = EmailSubjectType.FORGOT_PASSWORD

    await this.mailService.sendMail(userInfo.email, template, subject)

    console.log(link);
    console.log(userInfo.email);
    return {
      message: `A link has been sent to your email`,
      id: userId,
      token
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
    const refreshToken = req.cookies['jwt'];
    const decodeRfToken = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    const user = await this.userRepo.findOne({
      where: { id: decodeRfToken.id },
    });
    if (!user) throw new HttpException(`Forbidden`, 403);
    const refreshTokenFromDB = user.refreshToken;
    const decrypt = await bcrypt.compare(refreshToken, refreshTokenFromDB);
    if (!decrypt) throw new HttpException(`Forbidden`, 403);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    return { accessToken };
    // if (user.id !== checkJwtAuth.id) throw new HttpException(`Forbidden`, 403)
  }
}
