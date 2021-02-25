## Installation

```sh
# Locally in your project.
npm install @experium/nest-bruteforce-guard
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

### Save attempt when login failed by password
await this.bruteforceGuard.saveLoginAttempt(user.username, request.ip);

### Clear attempts when login success
await this.bruteforceGuard.clearLoginAttempts(user.username, request.ip);
```
