import { MongoRepository } from 'typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';

export class BruteforceGuardService {
    constructor(protected readonly repository: MongoRepository<LoginAttempt>) {
    }

    async checkLoginAttemptToBruteforce(login: string, hash: string): Promise<boolean> {


        return true;
    }

    async remove(entity: LoginAttempt): Promise<void> {
        await this.repository.remove([entity]);
    }

    async save(entity: LoginAttempt) {
        // @ts-ignore
        return await this.repository.save(entity);
    }
}
