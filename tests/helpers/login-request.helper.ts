import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export class LoginRequestHelper {

    constructor(private readonly app: INestApplication) {}

    async login(post: any, url: string = '/login') {
        return await request(this.app.getHttpServer())
            .post(url)
            .send(post)
        ;
    }

    async tryLogin(
        count: number,
        post: any = { login: 'admin', password: 'admin' },
        url: string = '/login',
        expectedStatus = 401,
    ) {
        for (let i = 0; i < count; i++) {
            const response = await this.login(post, url);

            if (response.status !== expectedStatus) {
                return false;
            }
        }

        return true;
    }

    async tryLoginWithRandomUsername(
        count: number,
        post: any,
        url: string = '/login',
        expectedStatus = 401,
    ) {
        for (let i = 0; i < count; i++) {
            const response = await this.login({
                login: Math.random().toString(36).substring(7),
                password: post.password,
            }, url);

            if (response.status !== expectedStatus) {
                return false;
            }
        }

        return true;
    }
}
