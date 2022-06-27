import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';
import { BruteforceGuardConfiguration } from './config/bruteforce-quard.configuration';
import { BruteforceGuardService } from './bruteforce-guard.service';
import { BRUTEFORCE_GUARD_OPTIONS_PROVIDER } from './constants';
import { BruteforceGuardInterceptor } from './bruteforce-guard.interceptor';
import { BadPasswordException } from './exception/bad-password.exception';
import { UserDisabledException } from './exception/user-disabled.exception';
import { UserNotFoundException } from './exception/user-not-found.exception';
import { BruteforceDetectionException } from './exception/bruteforce-detection.exception';
import { UserNotFoundExceptionCatcher } from './catcher/user-not-found-exception.catcher';
import { BadPasswordExceptionCatcher } from './catcher/bad-password-exception.catcher';
import { UserDisabledExceptionCatcher } from './catcher/user-disabled-exception.catcher';
import { ExceptionCatcherRegistry } from './catcher/exception-catcher.registry';

@Global()
@Module({})
export class BruteforceGuardModule {
  static async forRootAsync(config: BruteforceGuardConfiguration, typeOrmModule): Promise<DynamicModule> {
    return {
      module: BruteforceGuardModule,
      imports: [typeOrmModule.forFeature([LoginAttempt])],
      providers: [
        {
          provide: BRUTEFORCE_GUARD_OPTIONS_PROVIDER,
          useValue: config,
        },
        BruteforceGuardService,
        BruteforceGuardInterceptor,
        BadPasswordException,
        UserDisabledException,
        UserNotFoundException,
        BruteforceDetectionException,
        BadPasswordExceptionCatcher,
        UserNotFoundExceptionCatcher,
        UserDisabledExceptionCatcher,
        ExceptionCatcherRegistry,
      ],
      exports: [
        BruteforceGuardService,
        BruteforceGuardInterceptor,
        BadPasswordException,
        UserDisabledException,
        UserNotFoundException,
        BruteforceDetectionException,
      ],
    };
  }
}
