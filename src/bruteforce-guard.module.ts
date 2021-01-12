import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Applicant])],
})
export class BruteforceGuardModule {
}
