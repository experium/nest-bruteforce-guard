import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { addHours } from 'date-fns';
import { MongoRepository } from 'typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';

export class BruteforceGuardService {
    constructor(
        private readonly repository: MongoRepository<LoginAttempt>,
        private configService: ConfigService,
        private eventEmitter: EventEmitter2,
    ) {
    }

    async checkLoginAttemptToBruteforce(login: string, hash: string, ip: string): Promise<boolean> {
        const loginAttemptCount = await this.findLoginAttemptCount(login);
        const passwordAttemptCount = await this.findPasswordAttemptCount(hash);

        if (
            loginAttemptCount > this.configService.get<number>('loginAttemptCount') ||
            passwordAttemptCount > this.configService.get<number>('loginAttemptCount')
        ) {
            this.eventEmitter.emit('bruteforce-detection');
        }

        await this.save(new LoginAttempt(login, hash, ip));

        return true;
    }

    async remove(entity: LoginAttempt): Promise<void> {
        await this.repository.remove([entity]);
    }

    async save(entity: LoginAttempt) {
        // @ts-ignore
        return await this.repository.save(entity);
    }

    private async findLoginAttemptCount(login: string): Promise<number> {
        return await this.repository.count({
            login,
            date: {
                $gt: addHours(new Date(), -(this.configService.get<number>('loginAttemptHours'))),
            },
        });
    }

    private async findPasswordAttemptCount(hash: string): Promise<number> {
        return await this.repository.count({
            hash,
            date: {
                $gt: addHours(new Date(), -(this.configService.get<number>('loginAttemptHours'))),
            },
        });
    }
}
