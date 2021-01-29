import { AbstractExceptionCatcher } from './abstract-exception.catcher';

export class ExceptionCatcherRegistry {
    private catchers: AbstractExceptionCatcher[] = [];

    register(catcher: AbstractExceptionCatcher) {
        this.catchers.push(catcher);
    }

    getAll(): AbstractExceptionCatcher[] {
        return this.catchers;
    }
}
