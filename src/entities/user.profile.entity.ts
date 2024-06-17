import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserSignup } from "./signUp.details";
import { Role } from "../enum/role";
// import { GoogleUser } from "./google.entity";
import { QuizEntity } from "./quiz.entity";

@Entity()
export class UserProfile extends BaseEntity {
  @Column()
  fullName: string;

  @Column({
    unique: true,
  })
  userName: string;

  @Column()
  course: string;

  @OneToOne(() => UserSignup, (userSignup) => userSignup.userProfile, {
    onDelete: 'CASCADE',
  })
  signupDetails: UserSignup;

  @OneToMany(() => QuizEntity, (quizEntity) => quizEntity.userProfile)
  quiz: QuizEntity[];
}