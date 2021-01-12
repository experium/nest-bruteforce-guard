import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { LoginAttempt } from './entity/login-attempt.entity';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([LoginAttempt])],
})
export class BruteforceGuardModule {
}
