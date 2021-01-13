import { Column, Entity, Index } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity()
@Index(['login', 'date'], { expireAfterSeconds: 86400 })
@Index(['hash', 'date'], { expireAfterSeconds: 86400 })
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

    constructor(login: string, hash: string, ip: string) {
        this.login = login;
        this.hash = hash;
        this.ip = ip;
        this.date = new Date();
    }
}
