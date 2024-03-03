import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserProfile } from "./user.profile.entity";
import { JwtService } from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';

@Entity()
export class GoogleUser extends BaseEntity{
    @Column()
    profileName: string;

    @Column()
    email: string;

    @OneToOne(() => UserProfile, userProfile => userProfile.googleUser)
    @JoinColumn()
    userProfile: UserProfile;


    // async googleUserJwt() {
    //     const payload = {
    //         expiresIn: '5m',
    //         sub: this.id,
    //         email: this.email,
    //     };
    //     const secret = 'mySecret'
    //     const token =  jwt.sign(payload, secret);
    //     return token
    // }
}