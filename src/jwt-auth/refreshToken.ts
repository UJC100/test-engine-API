import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from 'express';
import { Injectable } from "@nestjs/common";


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

    async validate(req: Request, payload: any) {
      const refreshToken = req.get('authorization').replace('bearer', '').trim()
    // console.log(payload)
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      refreshToken
    };
  }
}