import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserSignup } from "./signUp.details";

@Entity()
export class UserProfile extends BaseEntity {
  @Column()
  fullName: string;

    @Column({
      unique:true
  })
  userName: string;

  @Column()
  course: string;
    
  @OneToOne(() => UserSignup, userSignup => userSignup.userProfile)
  signupDetails: UserSignup
}