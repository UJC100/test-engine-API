import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt.guard';
import { Response, Request } from 'express';
import { UpdateLoginDetailsDto } from 'src/dto/update.login.dto';
import { ResetPasswordDto } from 'src/dto/resetPassword.dto';
import { ForgotPasswordDto } from 'src/dto/forgotPassword.dto';
import { GoogleUserDto } from 'src/dto/google.signup.dto';




@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  async signup(@Body() payload: SignupDto) {
    return await this.userService.signup(payload);
    
  }

  @Post('signin')
  async signin(@Body() payload: LoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const jwtToken = await this.userService.login(payload, res, req);
    
    res.cookie('jwt', jwtToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
       return res.status(HttpStatus.OK).json({
         success: true,
         userToken: jwtToken,
       });
  }

  @Post('googleSignin')
  async googleSignin(@Body() payload: GoogleUserDto, @Res({ passthrough: true }) res: Response) {
      return await this.userService.googleSignup(payload)
    }

  //   @UseGuards(JwtAuthGuard)
  @Get('allUsers')
  async getAllUsers(@Req() req: Request) {
    return await this.userService.getAllUsers(req);
  }

  @Get('fetchUser/:id')
  async getOneUser(@Param('id') id: string, @Req() req: Request) {
    return this.userService.getOneUser(id, req)
  }

  @Patch('updateLogin')
  async updateUserLogin(@Body() userPayload: UpdateLoginDetailsDto, @Req() req: Request) {
    return await this.userService.updateLoginDetails(userPayload, req)
  }

  @Get('logout')
  async logout(@Res() res: Response) {
       res.clearCookie('jwt', {
         httpOnly: true,
       });
    
    return res.json({
      message: `User logged-out`,
    }).status(HttpStatus.OK);
  }

   @Post('forgotPassword')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return await this.userService.forgotPassword(payload)
  }

  @Post('resetPassword/:userId/:token')
  async resetPassword(@Body() payload: ResetPasswordDto, @Param('userId') userId: string, @Param('token') token: string) {
    console.log(userId, token)

    return await this.userService.resetPassword(payload, userId, token)
  }
}
