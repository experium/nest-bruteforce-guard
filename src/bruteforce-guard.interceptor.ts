import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BruteforceGuardService } from './bruteforce-guard.service';

@Injectable()
export class BruteforceGuardInterceptor implements NestInterceptor {

    constructor(private readonly bruteforceGuardService: BruteforceGuardService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        await this.bruteforceGuardService.canLogin(context);

        return next.handle().pipe(
            await catchError(async (err) => {
                await this.bruteforceGuardService.saveErrorAttempt(context, err);

                throw err;
            }),
            await tap(async () => await this.bruteforceGuardService.saveSuccessAttempt(context)),
        );
    }
}
