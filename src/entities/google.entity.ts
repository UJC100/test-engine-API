import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserProfile } from "./user.profile.entity";


@Entity()
export class GoogleUser extends BaseEntity{
    @Column()
    profileName: string;

    @Column()
    email: string;

    @OneToOne(() => UserProfile, userProfile => userProfile.googleUser)
    @JoinColumn()
    userProfile: UserProfile
}