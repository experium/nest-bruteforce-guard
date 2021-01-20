import { Request } from 'express';
import {
    Body,
    Controller,
    ForbiddenException,
    HttpCode, LiteralObject,
    Post,
    Req,
    UnauthorizedException,
    UseGuards
} from "@nestjs/common";
import { BruteforceGuard } from '../../src/bruteforce-guard';
import { LoginEntityOptions } from '../../src/login-entity-options.decorator';
import { BruteforceGuardService } from '../../dist/bruteforce-guard.service';

const users = ['admin', 'manager', 'å'];

export const testCallback = () => {
    throw new Error('Bruteforce guard error');
};

export const httpExceptionCallback = () => {
    throw new ForbiddenException('Too many login attempts');
};

@Controller()
export class SecurityController {

    constructor(private readonly bruteforceGuardService: BruteforceGuardService) {}

    @UseGuards(BruteforceGuard)
    @LoginEntityOptions({
        loginFieldName: 'login',
        passwordFieldName: 'password',
        callback: httpExceptionCallback,
    })
    @HttpCode(200)
    @Post('login')
    async login(@Body() body: any, @Req() request: Request): Promise<LiteralObject> {
        const login = body.login;
        const password = body.password;

        if (users.indexOf(login) > -1 && password === login) {
            await this.bruteforceGuardService.clearLoginAttempts(login, request.ip);

            return { success: true, username: login };
        }

        await this.bruteforceGuardService.saveLoginAttempt(login, request.ip);

        throw new UnauthorizedException();
    }

    @UseGuards(BruteforceGuard)
    @LoginEntityOptions({
        loginFieldName: 'email',
        passwordFieldName: 'pwd',
    })
    @HttpCode(200)
    @Post('custom-login')
    async customLogin(@Body() body: any, @Req() request: Request): Promise<boolean> {
        const login = body.email;
        const password = body.pwd;

        if (users.indexOf(login) > -1 || password === login) {
            await this.bruteforceGuardService.clearLoginAttempts(login, request.ip);

            return true;
        }

        await this.bruteforceGuardService.saveLoginAttempt(login, request.ip);

        throw new UnauthorizedException();
    }
}
