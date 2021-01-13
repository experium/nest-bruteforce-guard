import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoginAttempt } from './entity/login-attempt.entity';
import configuration from '../config/default';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([LoginAttempt]),
        ConfigModule.forRoot({
            load: [configuration],
        }),
        EventEmitterModule.forRoot(),
    ],
})
export class BruteforceGuardModule {
}
