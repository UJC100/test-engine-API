import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserProfile } from "./user.profile.entity";
import { Role } from "src/enum/role";

@Entity()
export class UserSignup extends BaseEntity {
  @Column({
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true, default: false })
  isGoogle: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.student,
  })
  role: Role;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.signupDetails, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  userProfile?: UserProfile;

}



@Entity()
export class TemporaryUserTable extends BaseEntity {
  @Column({
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true, default: false })
  isGoogle: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.student,
  })
  role: Role;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.signupDetails, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  userProfile?: UserProfile;
}