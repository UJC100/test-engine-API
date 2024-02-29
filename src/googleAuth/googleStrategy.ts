import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: process.env.CLIENT_ID ,
                clientSecret:process.env.CLIENT_SECRET,
            callBackURL:'http://127.0.0.1:2021/google/redirect',
            scope: ['profile', 'email']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        console.log(accessToken)
        console.log(refreshToken);
        console.log(profile);
    }
}