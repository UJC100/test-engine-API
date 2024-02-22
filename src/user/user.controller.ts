import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt.guard';
import { Response, Request } from 'express';




@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() payload: SignupDto) {
    return await this.userService.signup(payload);
  }

  @Post('signin')
  async signin(@Body() payload: LoginDto, @Res({passthrough: true}) res: Response) {
    return await this.userService.login(payload, res);
  }

//   @UseGuards(JwtAuthGuard)
  @Get('allUsers')
  async getAllUsers(@Req() req: Request) {
    return await this.userService.getAllUsers(req);
  }
}
