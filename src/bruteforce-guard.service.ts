import { Inject } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { MongoRepository } from 'typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';
import { BRUTEFORCE_GUARD_OPTIONS_PROVIDER } from './constants';
import { BruteforceGuardConfiguration } from './config/bruteforce-quard.configuration';
import { InjectRepository } from '@nestjs/typeorm';

export class BruteforceGuardService {
  constructor(
    @InjectRepository(LoginAttempt)
    private readonly repository: MongoRepository<LoginAttempt>,
    @Inject(BRUTEFORCE_GUARD_OPTIONS_PROVIDER)
    readonly config: BruteforceGuardConfiguration,
  ) {}

  async canLogin(login: string, ip: string): Promise<boolean> {
    const loginAttemptsCount = await this.getAttemptsCountByLogin(login);
    const ipAttemptsCount = await this.getAttemptsCountByIP(ip);

    return loginAttemptsCount < this.config.attemptCountByLogin && ipAttemptsCount < this.config.attemptCountByIp;
  }

  async saveLoginAttempt(login: string, ip: string): Promise<void> {
    await this.repository.save(new LoginAttempt(login, ip));
  }

  async clearLoginAttempts(login?: string, ip?: string): Promise<void> {
    await this.repository.deleteMany({ login });
    await this.repository.deleteMany({ ip });
  }

  async save(entity: LoginAttempt) {
    return await this.repository.save(entity);
  }

  private async getAttemptsCountByLogin(login: string): Promise<number> {
    return await this.repository.count({
      login,
      date: {
        $gt: addMinutes(new Date(), -this.config.attemptMinutesByLogin),
      },
    });
  }

  private async getAttemptsCountByIP(ip: string): Promise<number> {
    return await this.repository.count({
      ip,
      date: {
        $gt: addMinutes(new Date(), -this.config.attemptMinutesByIp),
      },
    });
  }
}
