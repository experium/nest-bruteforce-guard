import { ExceptionCatcherRegistry } from './exception-catcher.registry';
import { LoginAttempt } from '../entity/login-attempt.entity';
import { ExecutionContext } from '@nestjs/common';
import { BruteforceGuardConfiguration } from '../config/bruteforce-quard.configuration';

interface LoginAttemptPayload {
  login: string;
  ip: string;
}

export abstract class AbstractExceptionCatcher {
  config: BruteforceGuardConfiguration;

  abstract catch(exception, context: ExecutionContext): LoginAttempt;

  abstract supports(exception: any): boolean;

  constructor(registry: ExceptionCatcherRegistry, config: BruteforceGuardConfiguration) {
    registry.register(this);
    this.config = config;
  }

  handle(exception: any, context: ExecutionContext): LoginAttempt {
    if (this.supports(exception)) {
      return this.catch(exception, context);
    }
  }

  getPayloadByContext(context: ExecutionContext): LoginAttemptPayload {
    const login = this.getLoginByContext(context);
    const ip = context.switchToHttp().getRequest().ip;

    return {
      ip,
      login,
    };
  }

  protected getLoginByContext(context: ExecutionContext): string {
    const loginField = this.config.loginField;

    return context.switchToHttp().getRequest().body[loginField];
  }
}
