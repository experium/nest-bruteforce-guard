import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { BruteforceGuard } from '../../src/bruteforce-guard';
import { LoginEntityOptions } from '../../src/login-entity-options.decorator';

@Controller()
export class SecurityController {

    @UseGuards(BruteforceGuard)
    @LoginEntityOptions({
        loginFieldName: 'username',
        passwordFieldName: 'password',
        callback: () => {},
    })
    @Post('login')
    async login(@Body() body: any, @Req() request: Request): Promise<boolean> {
        return true;
    }
}
