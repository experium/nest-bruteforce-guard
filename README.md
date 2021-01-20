## Installation

```sh
# Locally in your project.
npm install nest-bruteforce-guard
```

## Configuration

```
import { BruteforceGuardModule } from 'nest-bruteforce-guard';

BruteforceGuardModule.setUp({
    attemptMinutesByLogin: 120,
    attemptMinutesByIp: 30,
    attemptCountByLogin: 5,
    attemptCountByIp: 10,
}),
```

## Usage

```

### Decorator on controller login action
@UseGuards(BruteforceGuard)
@LoginEntityOptions({
    loginFieldName: 'username',
    passwordFieldName: 'password',
    callback: () => {},
})
@Post('login')
async login(@Body() body: any, @Req() request: Request): Promise<boolean> {
}

### Save attempt when login failed by password
await this.bruteforceGuard.saveLoginAttempt(user.username, request.ip);

### Clear attempts when login success
await this.bruteforceGuard.clearLoginAttempts(user.username, request.ip);
```
