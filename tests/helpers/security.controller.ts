import { Request } from 'express';
import {
    Body,
    Controller,
    HttpCode, LiteralObject,
    Post,
    Req,
    UseInterceptors,
} from "@nestjs/common";
import { BruteforceGuardInterceptor } from '../../src/bruteforce-guard.interceptor';
import { UserNotFoundException } from '../../src/exception/user-not-found.exception';
import { BadPasswordException } from '../../src/exception/bad-password.exception';
import { UserDisabledException } from '../../src/exception/user-disabled.exception';

const users = ['admin', 'disabled'];

@Controller()
export class SecurityController {
    @UseInterceptors(BruteforceGuardInterceptor)
    @HttpCode(200)
    @Post('login')
    async login(@Body() body: any, @Req() request: Request): Promise<LiteralObject> {
        const login = body.login;
        const password = body.password;

        if (users.indexOf(login) < 0) {
            throw new UserNotFoundException();
        }

        if (login === 'disabled') {
            throw new UserDisabledException();
        }

        if (users.indexOf(login) > -1 && password === login) {
            return { success: true, username: login };
        }

        throw new BadPasswordException();
    }
}
