import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';
import { BruteforceGuardConfiguration } from './config/bruteforce-quard.configuration';
import { BruteforceGuardService } from './bruteforce-guard.service';
import { BRUTEFORCE_GUARD_OPTIONS_PROVIDER } from './constants';
import { BruteforceGuard } from './bruteforce-guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LoginAttempt])],
})
export class BruteforceGuardModule {
  static setUp(config: BruteforceGuardConfiguration): DynamicModule {
    return {
      module: BruteforceGuardModule,
      providers: [
        {
          provide: BRUTEFORCE_GUARD_OPTIONS_PROVIDER,
          useValue: config,
        },
        BruteforceGuardService,
        BruteforceGuard,
      ],
      exports: [BruteforceGuardService, BruteforceGuard],
    };
  }
}
