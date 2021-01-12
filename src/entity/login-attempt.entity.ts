import { Column } from 'typeorm';
import { ObjectID } from 'mongodb';

export class LoginAttempt {
    @Column()
    id: ObjectID;

    @Column()
    login: string;

    @Column()
    hash: string;

    @Column()
    date: Date;

    @Column()
    ip: string;
}
