import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Role } from "src/enum/role";
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

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.student,
  })
    role: Role;
    
    @OneToOne(() => UserSignup, userSignup => userSignup.userProfile)
    signupDetails: UserSignup
}