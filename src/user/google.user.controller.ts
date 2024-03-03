import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { GoogleAuthGaurd } from "src/googleAuth/google.guard";
import { Response, Request } from "express";

@Controller('google')
export class GoogleUserController {
  constructor(private readonly userService: UserService) {}

  @Get('login')
  @UseGuards(GoogleAuthGaurd)
  googleLogin() {}

  @Get('redirect')
  @UseGuards(GoogleAuthGaurd)
  googleRedirect() {
    
    //   res.cookie('jwt', token, {
    //   httpOnly: true,
    //   maxAge: 120 * 1000,
    // });
  }
}