import { Injectable} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Response } from "express";
import { Profile, Strategy } from "passport-google-oauth20";
import { UserService } from "../user/user.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          callbackURL: 'http://127.0.0.1:2021/google/redirect',
          scope: ['profile', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        console.log(accessToken)
        console.log(refreshToken);
        console.log(profile);

        const email = profile.emails[0].value;
        const username = profile.displayName
        const user = await this.userService.findUserByEmail(email)
        if (!user) {
               await this.userService.signup({
                 username,
                 email
               });
        }
        
        return user
    }
}