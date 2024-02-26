import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt.guard';
import { Response, Request } from 'express';
import { UpdateLoginDetailsDto } from 'src/dto/update.login.dto';




@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  async signup(@Body() payload: SignupDto) {
    return await this.userService.signup(payload);
  }

  @Post('signin')
  async signin(@Body() payload: LoginDto, @Res({ passthrough: true }) res: Response) {
    return await this.userService.login(payload, res);
  }

  //   @UseGuards(JwtAuthGuard)
  @Get('allUsers')
  async getAllUsers(@Req() req: Request) {
    return await this.userService.getAllUsers(req);
  }

  @Get('fetchUser/:id')
  async getOneUser(@Param('id') id: number, @Req() req: Request) {
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
}
