## Installation

```sh
# Locally in your project.
npm install nest-bruteforce-guard
```

## Configuration

```
import { BruteforceGuardModule } from 'nest-bruteforce-guard';

@Module({
    imports: [
        //...
        BruteforceGuardModule.setUp({
            attemptMinutesByLogin: 120,
            attemptMinutesByIp: 30,
            attemptCountByLogin: 5,
            attemptCountByIp: 10,
        })
    ],
})
export class ApplicationModule {
}
```

## Usage

```

### Decorator on controller login action
import { ExecutionContext } from '@nestjs/common';

@UseGuards(BruteforceGuard)
@LoginEntityOptions({
    loginFieldName: 'username',
    passwordFieldName: 'password',
    callback: (context: ExecutionContext) => {
        throw new ForbiddenException('Too many login attempts');
    },
})
@Post('login')
async login(@Body() body: any, @Req() request: Request): Promise<boolean> {
}

### Save attempt when login failed by password
await this.bruteforceGuard.saveLoginAttempt(user.username, request.ip);

### Clear attempts when login success
await this.bruteforceGuard.clearLoginAttempts(user.username, request.ip);
```
