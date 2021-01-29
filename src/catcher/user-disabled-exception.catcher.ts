import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AbstractExceptionCatcher } from './abstract-exception.catcher';
import { ExceptionCatcherRegistry } from './exception-catcher.registry';
import { LoginAttempt } from '../entity/login-attempt.entity';
import { BRUTEFORCE_GUARD_OPTIONS_PROVIDER } from '../constants';
import { BruteforceGuardConfiguration } from '../config/bruteforce-quard.configuration';
import { UserDisabledException } from '../exception/user-disabled.exception';

@Injectable()
export class UserDisabledExceptionCatcher extends AbstractExceptionCatcher {

    constructor(
        registry: ExceptionCatcherRegistry,
        @Inject(BRUTEFORCE_GUARD_OPTIONS_PROVIDER)
        readonly config: BruteforceGuardConfiguration,
    ) {
        super(registry, config);
    }

    supports(exception: any): boolean {
        return exception instanceof UserDisabledException;
    }

    catch(exception: UserDisabledException, context: ExecutionContext): LoginAttempt {
        const { login, ip } = this.getPayloadByContext(context);

        return new LoginAttempt(login, ip, true, false, true);
    }
}
