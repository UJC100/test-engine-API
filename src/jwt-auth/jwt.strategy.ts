import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";



@Injectable()
export class JwtSrategy extends PassportStrategy(Strategy, 'access') {
    constructor(private userService: UserService) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        });
    }

    async validate(payload: any) {
        return {
            id: payload.id,
            email: payload.email,
            role: payload.role
        }
    }
}