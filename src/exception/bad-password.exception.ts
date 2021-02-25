import { UnauthorizedException } from '@nestjs/common';

export class BadPasswordException extends UnauthorizedException {}
