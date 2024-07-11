import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserSignup } from "./signUp.details";

@Entity()
export class QuizScore extends BaseEntity {
  @Column()
  week: string;

  @Column()
  course: string;

  @Column()
  score: number;
    
  @ManyToOne(() => UserSignup, (user) => user.score)
  user: UserSignup;
}