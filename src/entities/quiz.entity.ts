import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserSignup } from "./signUp.details";

@Entity()
export class QuizEntity extends BaseEntity {
  @Column()
  week: string;

  @Column()
  course: string;

  @Column()
  question: string;

  @Column('varchar', { array: true })
  options: string[];

  @Column()
  correctAnswer: string;

  @ManyToOne(() => UserSignup, (user) => user.quizes, {
    onDelete: 'SET NULL',
  })
  user: UserSignup;
}

