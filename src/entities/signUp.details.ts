import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserProfile } from "./user.profile.entity";

@Entity()
export class UserSignup extends BaseEntity {
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;


  @OneToOne(() => UserProfile, (userProfile) => userProfile.signupDetails)
  @JoinColumn()
  userProfile: UserProfile;


  toResponseObj() {
    const { password, ...rest } = this
    
    return rest
  }

  ProfileResponseObj() {
    const { password, createdAt, updatedAt, ...rest } = this
    
    return rest
  }
}