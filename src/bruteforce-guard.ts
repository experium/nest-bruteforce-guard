import { Reflector } from '@nestjs/core';
import { ExecutionContext, CanActivate, Injectable } from '@nestjs/common';
import { BruteforceGuardService } from './bruteforce-guard.service';

@Injectable()
export class BruteforceGuard implements CanActivate {

    constructor(private readonly reflector: Reflector, private readonly bruteforceService: BruteforceGuardService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const options: any = this.reflector.get<string[]>('options', context.getHandler());
        const login = request.body[options.loginFieldName];
        const password = request.body[options.passwordFieldName];

        if (!login || !password) {
            return true;
        }

        if (!(await this.bruteforceService.canLogin(login, request.ip))) {
            if (options.callback && typeof options.callback === 'function') {
                options.callback();
            }

            return false;
        }

        return true;
    }

}
