import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

describe('test bruteforce guard', () => {
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule()
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Guard test', async () => {

    });
});
