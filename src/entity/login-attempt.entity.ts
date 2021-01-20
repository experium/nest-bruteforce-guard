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
  @Index({ expireAfterSeconds: 84600 })
  date: Date;

  constructor(login: string, ip: string) {
    this.login = login;
    this.ip = ip;
    this.date = new Date();
  }
}
