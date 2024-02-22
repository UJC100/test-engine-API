import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from 'src/dto/signup.dto';
import { LoginDto } from 'src/dto/login.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    
    @Post('signup')
    async signup(@Body() payload: SignupDto) {
        return await this.userService.signup(payload)
    }

    @Post('signin')
    async signin(@Body() payload: LoginDto) {
        return await this.userService.login(payload)
    }

    @Get('allUaers')
    async getAllUsers() {
        return await this.userService.getAllUsers()
    }
}
