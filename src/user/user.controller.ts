import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from 'src/dto/signup.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    
    @Post('signup')
    async signup(@Body() payload: SignupDto) {
        return await this.userService.signup(payload)
    }
}
