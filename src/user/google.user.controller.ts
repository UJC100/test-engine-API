import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { GoogleAuthGaurd } from "src/googleAuth/google.guard";

@Controller('google')
export class GoogleUserController {
  constructor(private readonly userService: UserService) {}

  @Get('login')
  @UseGuards(GoogleAuthGaurd)
  googleLogin() {}

  @Get('redirect')
  @UseGuards(GoogleAuthGaurd)
  googleRedirect() {}
}