import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('')
export class GoogleUserController {
    constructor(private readonly userService: UserService) { }
    
    @Get('google/login')
    googleLogin() {
        
    }

    @Get('google/redirect')
    googleRedirect() {
        
    }
}