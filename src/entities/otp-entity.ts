import { BaseEntity } from './base.entity';
import { EmailType } from '../enum/email-enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class Otp extends BaseEntity {
  @Column()
  email: string;

  @Column()
  code: number;

  @Column({
    type: 'enum',
    enum: EmailType,
    default: EmailType.VERIFY_EMAIL,
  })
  type: string;
}
