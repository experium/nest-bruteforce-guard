import { ExecutionContext, SetMetadata } from '@nestjs/common';

interface LoginEntityOptions {
  loginFieldName?: string;
  passwordFieldName?: string;
  callback?: (context?: ExecutionContext) => void;
}

export const LoginEntityOptions = (options: LoginEntityOptions) => SetMetadata('options', options);
