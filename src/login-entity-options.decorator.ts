import { SetMetadata } from '@nestjs/common';

interface LoginEntityOptions {
    loginFieldName?: string;
    passwordFieldName?: string;
    callback?: () => void
}

export const LoginEntityOptions = (options: LoginEntityOptions) => SetMetadata('options', options);
