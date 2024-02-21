import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserProfile } from "./user.profile.entity";
import { Role } from 'src/enum/role';

@Entity()
export class UserSignup extends BaseEntity {
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.student,
  })
    role: Role;
    
  @OneToOne(() => UserProfile, (userProfile) => userProfile.signupDetails)
  @JoinColumn()
  userProfile: UserProfile;
}