import { UnauthorizedException } from '@nestjs/common';

export class UserDisabledException extends UnauthorizedException {
  constructor(objectOrError?: string | object | any, description?: string) {
    super(objectOrError, description);
  }
}
