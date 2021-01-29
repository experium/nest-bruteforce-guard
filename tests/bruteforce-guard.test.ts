import * as chai from 'chai';
import { Connection } from 'typeorm';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SecurityController } from './helpers/security.controller';
import { BruteforceGuardModule } from '../src/bruteforce-guard.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressAdapter } from '@nestjs/platform-express';
import { LoginRequestHelper } from './helpers/login-request.helper';
import { BruteforceGuardService } from '../src/bruteforce-guard.service';

const expect = chai.expect;

let app: INestApplication;
let loginHelper;
let bruteforceGuardService;

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
                    loginField: 'login',
                }),
            ],
            controllers: [SecurityController],
        }).compile();

        const express = new ExpressAdapter().getInstance();

        app = moduleRef.createNestApplication(new ExpressAdapter(express));
        await app.init();

        loginHelper = new LoginRequestHelper(app);
        bruteforceGuardService = app.get(BruteforceGuardService);
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        const connection = app.get(Connection);
        await connection.dropDatabase();
    });

    it('should deny login when ip attempt greater then expected', async () => {
        const payload = {
            login: 'some-login',
            password: 'admon',
        };
        expect(await loginHelper.tryLoginWithRandomUsername(10, payload)).to.be.true;

        const response = await loginHelper.login(payload, '/login');

        expect(response.status).to.be.equal(403);
        expect(response.body.message).to.be.equal('Bruteforce detection');

        const loginFailureCursor = await bruteforceGuardService.findByFilter({
            loginFailure: true,
            userDisabled: false,
            badPassword: false,
            attemptBlocked: false,
        });

        const loginFailureAttempts = await loginFailureCursor.toArray();
        expect(loginFailureAttempts.length).to.equal(10);

        const attemptBlockedCursor = await bruteforceGuardService.findByFilter({
            loginFailure: true,
            userDisabled: false,
            badPassword: false,
            attemptBlocked: true,
        });

        const blockedAttempts = await attemptBlockedCursor.toArray();
        expect(blockedAttempts.length).to.equal(1);
    });

    it('should deny login when login with bad password attempt greater then expected', async () => {
        const payload = {
            login: 'admin',
            password: 'bad password',
        };
        expect(await loginHelper.tryLogin(5, payload)).to.be.true;

        const response = await loginHelper.login(payload, '/login');

        expect(response.status).to.be.equal(403);
        expect(response.body.message).to.be.equal('Bruteforce detection');

        const badPasswordCursor = await bruteforceGuardService.findByFilter({
            loginFailure: true,
            userDisabled: false,
            badPassword: true,
            attemptBlocked: false,
        });

        const badPasswordAttempts = await badPasswordCursor.toArray();
        expect(badPasswordAttempts.length).to.equal(5);

        const attemptBlockedCursor = await bruteforceGuardService.findByFilter({
            loginFailure: true,
            userDisabled: false,
            badPassword: false,
            attemptBlocked: true,
        });

        const blockedAttempts = await attemptBlockedCursor.toArray();
        expect(blockedAttempts.length).to.equal(1);
    });

    it('should deny login when login attempt greater then expected', async () => {
        const payload = {
            login: 'disabled',
            password: 'bad password',
        };
        expect(await loginHelper.tryLogin(5, payload)).to.be.true;

        const response = await loginHelper.login(payload, '/login');

        expect(response.status).to.be.equal(403);
        expect(response.body.message).to.be.equal('Bruteforce detection');

        const userDisabledCursor = await bruteforceGuardService.findByFilter({
            loginFailure: true,
            userDisabled: true,
            badPassword: false,
            attemptBlocked: false,
        });

        const userDisabledAttempts = await userDisabledCursor.toArray();
        expect(userDisabledAttempts.length).to.equal(5);

        const attemptBlockedCursor = await bruteforceGuardService.findByFilter({
            loginFailure: true,
            userDisabled: false,
            badPassword: false,
            attemptBlocked: true,
        });

        const blockedAttempts = await attemptBlockedCursor.toArray();
        expect(blockedAttempts.length).to.equal(1);
    });

    it('should save success attempt', async () => {
         const response = await loginHelper.login({
             login: 'admin',
             password: 'admin',
         });

        expect(response.status).to.be.equal(200);

        const successLoginCursor = await bruteforceGuardService.findByFilter({
            loginFailure: false,
            userDisabled: false,
            badPassword: false,
            attemptBlocked: false,
        });

        const successAttempts = await successLoginCursor.toArray();
        expect(successAttempts.length).to.equal(1);
    });
});


