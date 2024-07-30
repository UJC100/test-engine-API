import { BaseEntity } from './base.entity';
import { OtpType } from '../enum/email-enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class Otp extends BaseEntity {
  @Column()
  email: string;

  @Column()
  code: number;

  @Column({
    type: 'enum',
    enum: OtpType,
    default: OtpType.VERIFY_EMAIL,
  })
  type: string;
}
