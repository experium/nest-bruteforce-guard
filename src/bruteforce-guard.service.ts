import { addMinutes } from 'date-fns';
import { Cursor, MongoRepository, ObjectLiteral } from 'typeorm';
import * as escapeStringRegexp from 'escape-string-regexp';
import { ExecutionContext, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';
import { BRUTEFORCE_GUARD_OPTIONS_PROVIDER } from './constants';
import { BruteforceGuardConfiguration } from './config/bruteforce-quard.configuration';
import { BruteforceDetectionException } from './exception/bruteforce-detection.exception';
import { ExceptionCatcherRegistry } from './catcher/exception-catcher.registry';

export class BruteforceGuardService {
  constructor(
    @InjectRepository(LoginAttempt)
    private readonly repository: MongoRepository<LoginAttempt>,
    @Inject(BRUTEFORCE_GUARD_OPTIONS_PROVIDER)
    readonly config: BruteforceGuardConfiguration,
    private readonly registry: ExceptionCatcherRegistry,
  ) {}

  async canLogin(context: ExecutionContext): Promise<boolean> {
    const login = this.getLoginByContext(context);
    const ip = context.switchToHttp().getRequest().ip;
    const loginAttemptsCount = await this.getAttemptsCountByLogin(login);
    const ipAttemptsCount = await this.getAttemptsCountByIP(ip);

    if (
      login &&
      loginAttemptsCount < this.config.attemptCountByLogin &&
      ipAttemptsCount < this.config.attemptCountByIp
    ) {
      return true;
    }

    await this.repository.save(new LoginAttempt(login, ip, true, true));

    throw new BruteforceDetectionException();
  }

  async saveErrorAttempt(context: ExecutionContext, exception: any): Promise<void> {
    const login = this.getLoginByContext(context);
    const ip = context.switchToHttp().getRequest().ip;

    let loginAttempt = null;
    for (const catcher of this.registry.getAll()) {
      loginAttempt = catcher.handle(exception, context);
      if (!!loginAttempt) {
        break;
      }
    }

    if (!loginAttempt) {
      loginAttempt = new LoginAttempt(login, ip, false);
    }

    await this.repository.save(loginAttempt);
  }

  async findByFilter(filter: ObjectLiteral): Promise<Cursor<LoginAttempt>> {
    return this.repository.createEntityCursor(await this.getDefaultQuery(filter));
  }

  async getDefaultQuery(filter: ObjectLiteral): Promise<Partial<LoginAttempt>> {
    const query: ObjectLiteral = {};

    if ('login' in filter && filter.login) {
      query.login = {
        $regex: new RegExp(escapeStringRegexp(filter.login)),
        $options: 'i',
      };
    }

    if ('ip' in filter && filter.ip) {
      query.ip = {
        $regex: new RegExp(escapeStringRegexp(filter.ip)),
        $options: 'i',
      };
    }

    if ('attemptBlocked' in filter && typeof filter.attemptBlocked === 'boolean') {
      query.attemptBlocked = filter.attemptBlocked;
    }

    if ('loginFailure' in filter && typeof filter.loginFailure === 'boolean') {
      query.loginFailure = filter.loginFailure;
    }

    if ('userDisabled' in filter && typeof filter.userDisabled === 'boolean') {
      query.userDisabled = filter.userDisabled;
    }

    if ('badPassword' in filter && typeof filter.badPassword === 'boolean') {
      query.badPassword = filter.badPassword;
    }

    return query;
  }

  async saveSuccessAttempt(context: ExecutionContext): Promise<void> {
    const login = this.getLoginByContext(context);
    const ip = context.switchToHttp().getRequest().ip;

    await this.repository.save(new LoginAttempt(login, ip));
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
      loginFailure: true,
    });
  }

  private async getAttemptsCountByIP(ip: string): Promise<number> {
    return await this.repository.count({
      ip,
      date: {
        $gt: addMinutes(new Date(), -this.config.attemptMinutesByIp),
      },
      loginFailure: true,
    });
  }

  private getLoginByContext(context: ExecutionContext): string {
    const loginField = this.config.loginField;

    return context.switchToHttp().getRequest().body[loginField];
  }
}
