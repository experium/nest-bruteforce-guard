import * as chai from 'chai';
import { Connection } from 'typeorm';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SecurityController, testCallback } from './helpers/security.controller';
import { BruteforceGuardModule } from '../src/bruteforce-guard.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressAdapter } from '@nestjs/platform-express';
import { LoginRequestHelper } from './helpers/login-request.helper';

const expect = chai.expect;

let app: INestApplication;
let loginHelper;

describe('test bruteforce guard', () => {
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'mongodb',
                    host: process.env.DATABASE_HOST || 'mongo',
                    port: parseInt(process.env.DATABASE_PORT, 10) || 27017,
                    database: process.env.DATABASE_NAME || 'nest-bruteforce-guard-test',
                    entities: ['src/entity/login-attempt.entity.ts'],
                    useNewUrlParser: true,
                    synchronize: false,
                    keepConnectionAlive: false,
                    useUnifiedTopology: true,
                }),
                BruteforceGuardModule.setUp({
                    attemptMinutesByLogin: 120,
                    attemptMinutesByIp: 30,
                    attemptCountByLogin: 5,
                    attemptCountByIp: 10,
                }),
            ],
            controllers: [SecurityController],
        }).compile();

        const express = new ExpressAdapter().getInstance();

        app = moduleRef.createNestApplication(new ExpressAdapter(express));
        await app.init();

        loginHelper = new LoginRequestHelper(app);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        const connection = app.get(Connection);
        await connection.dropDatabase();
    });

    it('should show forbidden exception without callback', async () => {
        const payload = {
            email: 'admin@example.com',
            pwd: 'admon',
        };
        expect(await loginHelper.tryLogin(5, payload, '/custom-login')).to.be.true;

        const response = await loginHelper.login(payload, '/custom-login');

        expect(response.status).to.be.equal(403);
        expect(response.body.message).to.be.equal('Forbidden resource');
    });

    it('should use callback when ip attempt greater then expected', async () => {
        const payload = {
            login: 'some-login',
            password: 'admon',
        };
        expect(await loginHelper.tryLoginWithRandomUsername(10, payload)).to.be.true;

        const response = await loginHelper.login(payload, '/login');

        expect(response.status).to.be.equal(403);
        expect(response.body.message).to.be.equal('Too many login attempts');
    });

    it('should return forbidden response with callback', async () => {
        const payload = {
            login: 'admin',
            password: 'bad password',
        };
        expect(await loginHelper.tryLogin(5, payload)).to.be.true;

        const response = await loginHelper.login(payload, '/login');

        expect(response.status).to.be.equal(403);
        expect(response.body.message).to.be.equal('Too many login attempts');
    });

    it('should clear attempts after success login by username', async () => {
        expect(await loginHelper.tryLogin(4, {
            login: 'admin',
            password: 'admon',
        })).to.be.true;

        const response = await loginHelper.login({
            login: 'admin',
            password: 'admin',
        });

        expect(response.status).to.be.equal(200);
        expect(response.body.username).to.be.equal('admin');

        expect(await loginHelper.tryLogin(4, {
            login: 'admin',
            password: 'admon',
        })).to.be.true;
    });

    it('should clear attempts after success login by ip', async () => {
        expect(await loginHelper.tryLoginWithRandomUsername(9, {
            password: 'admon',
        })).to.be.true;

        await loginHelper.tryLogin(1, {
            login: 'admin',
            password: 'admin',
        });

        expect(await loginHelper.tryLoginWithRandomUsername(9, {
            password: 'admon',
        })).to.be.true;
    });
});


