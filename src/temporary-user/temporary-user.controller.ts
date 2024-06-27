import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from 'src/user/dto/user-dto';
import { UserService } from 'src/user/user.service';
import { TemporaryUserService } from './temporary-user.service';

@Controller('signup')
export class TemporaryUserController {
    constructor(private readonly tempUserService: TemporaryUserService){}


  @Post()
  async signup(@Body() payload: SignupDto) {
    return await this.tempUserService.createTemporaryUser(payload);
  }
}
