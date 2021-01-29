import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity()
@Index(['login', 'date'])
@Index(['ip', 'date'])
export class LoginAttempt {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  login: string;

  @Column()
  ip: string;

  @Column()
  @Index({ expireAfterSeconds: 31536000 }) //1 year
  date: Date;

  @Column()
  loginFailure: boolean;

  @Column()
  attemptBlocked: boolean;

  @Column()
  userDisabled: boolean;

  @Column()
  badPassword: boolean;

  constructor(
      login: string,
      ip: string,
      loginFailure: boolean = false,
      attemptBlocked: boolean = false,
      userDisabled: boolean = false,
      badPassword: boolean = false,
  ) {
    this.login = login;
    this.ip = ip;
    this.date = new Date();
    this.loginFailure = loginFailure;
    this.attemptBlocked = attemptBlocked;
    this.userDisabled = userDisabled;
    this.badPassword = badPassword;
  }
}
