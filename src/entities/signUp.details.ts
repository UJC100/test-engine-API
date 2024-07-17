import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Role } from "src/enum/role";
import { QuizEntity } from "./quiz.entity";
import { QuizScore } from "./quiz.score";

@Entity()
export class UserSignup extends BaseEntity {
  @Column({
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    nullable: true,
    unique: true,
  })
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
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  otherNames: string;

  @Column({ nullable: true })
  age:string

  @Column({ nullable: true })
  course: string;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToMany(() => QuizEntity, (quiz) => quiz.user, {
    onDelete: 'SET NULL',
  })
  quizes: QuizEntity[];

  @OneToMany(() => QuizScore, (score) => score.user)
  score: QuizScore[];
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

  @Column({
    nullable: true,
    unique: true,
  })
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

  @OneToMany(() => QuizEntity, (quiz) => quiz.user, {
    onDelete: 'SET NULL',
  })
  quizes?: QuizEntity[];
}