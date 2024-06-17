import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from './user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt.guard';
import { UpdateLoginDetailsDto } from 'src/dto/update.login.dto';
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';
import { ForgotPasswordDto } from 'src/dto/forgotPassword.dto';
import { GoogleUserDto } from 'src/dto/google.signup.dto';
import { User } from '../custome-decorators/user.decorator';
import { Http2ServerRequest } from 'http2';




@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() payload: SignupDto) {
    return await this.userService.signup(payload);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.userService.login(payload, res);
    //  res.status(HttpStatus.OK).json({
    //      success: true,
    //    });
  }

  @Post('googleSignin')
  async googleSignin(
    @Body() payload: GoogleUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.userService.googleSignup(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('allUsers')
  async getAllUsers(@Req() req: Request, @User('id') id: string) {
    return await this.userService.getAllUsers(req, id);
  }

  @Get('fetchUser/:id')
  async getOneUser(@Param('id') id: string, @Req() req: Request) {
    return this.userService.getOneUser(id, req);
  }

  @Patch('updateLogin')
  async updateUserLogin(
    @Body() userPayload: UpdateLoginDetailsDto,
    @Req() req: Request,
  ) {
    return await this.userService.updateLoginDetails(userPayload, req);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logOut(@User('id') userId: string, @Res() res: Response) {
    await this.userService.logout(userId);
    res.clearCookie('jwt', {
      httpOnly: true,
    });
    return res.status(HttpStatus.OK).json({
      message: 'Logged out',
    });
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return await this.userService.forgotPassword(payload);
  }

  @Post('resetPassword/:userId/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() payload: ResetPasswordDto,
    @Param('userId') userId: string,
    @Param('token') token: string,
  ) {
    console.log(userId, token);

    return await this.userService.resetPassword(payload, userId, token);
  }
}
