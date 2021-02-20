import { ForbiddenException } from '@nestjs/common';

export class BruteforceDetectionException extends ForbiddenException {
    constructor() {
        super('Bruteforce detection');
    }
}
