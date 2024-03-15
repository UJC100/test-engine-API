import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserProfile } from "./user.profile.entity";

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
    
  @ManyToOne(() => UserProfile, userProfile => userProfile.quiz)
  userProfile: UserProfile
}