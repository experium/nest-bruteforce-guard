import { UnauthorizedException } from '@nestjs/common';

export class BadPasswordException extends UnauthorizedException {
    constructor(objectOrError?: string | object | any, description?: string) {
        super(objectOrError, description);
    }
}
