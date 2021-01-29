import { ForbiddenException, HttpStatus } from '@nestjs/common';

export class BruteforceDetectionException extends ForbiddenException {
    constructor() {
        //@ts-ignore
        super('Bruteforce detection', HttpStatus.FORBIDDEN);
    }
}
