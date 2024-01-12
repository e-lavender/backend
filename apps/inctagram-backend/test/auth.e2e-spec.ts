import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../../../libs/core/app.settings';
import * as request from 'supertest';
import { randomUUID } from 'crypto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app, AppModule);
    await app.init();
    server = app.getHttpServer();

    // const mockEmailService = jest.fn().mockReturnValue(() => ({}));

    // const cleanDb = new CleanDbService(new PrismaService());
    // await cleanDb.deleteUsers();
  });

  it('1 - POST:auth/registration - 204 - register 1st & 2nd users', async () => {
    const firstUser = {
      login: `login${randomUUID().slice(0, 6)}`,
      email: `${randomUUID().slice(0, 6)}@gmail.com`,
      password: 'Qwerty1!',
    };
    const secondUser = {
      login: `login${randomUUID().slice(0, 6)}`,
      email: `${randomUUID().slice(0, 6)}@gmail.com`,
      password: 'Qwerty2!',
    };

    const registerFirstUserResponse = await request(server)
      .post('/api/v1/auth/registration')
      .send({
        login: firstUser.login,
        email: firstUser.email,
        password: firstUser.password,
      });

    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const registerSecondUserResponse = await request(server)
      .post('/api/v1/auth/registration')
      .send({
        login: secondUser.login,
        email: secondUser.email,
        password: secondUser.password,
      });

    expect(registerSecondUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    expect.setState({ firstUser, secondUser });
  });
  it('2 - POST:auth/registration-confirmation - 204 - confirm email', async () => {
    const { firstUser, secondUser } = expect.getState();

    //todo - написать мок, чтобы забирать confirmationCode?
    //сейчас работает эндпоинт, который достает код из БД по логину

    const getConfirmationCode1 = await request(server).get(
      `/api/v1/auth/${firstUser.login}`,
    );
    expect(getConfirmationCode1.body).toEqual({
      confirmationCode: expect.any(String),
      expirationDate: expect.any(String),
      isConfirmed: false,
      userId: expect.any(Number),
    });
    const firstCode = getConfirmationCode1.body.confirmationCode;
    // console.log({ firstCode: firstCode });

    const confirmFirstUserResponse1 = await request(server).get(
      `/api/v1/auth/registration-confirmation?code=${firstCode}`,
    );
    // console.log({ t_2: confirmFirstUserResponse1.body.errorsMessages });
    expect(confirmFirstUserResponse1.status).toEqual(HttpStatus.FOUND);

    //

    const getConfirmationCode2 = await request(server).get(
      `/api/v1/auth/${secondUser.login}`,
    );
    expect(getConfirmationCode2.body).toEqual({
      confirmationCode: expect.any(String),
      expirationDate: expect.any(String),
      isConfirmed: false,
      userId: expect.any(Number),
    });
    const secondCode = getConfirmationCode2.body.confirmationCode;
    // console.log({ secondCode: secondCode });

    const confirmFirstUserResponse2 = await request(server).get(
      `/api/v1/auth/registration-confirmation?code=${secondCode}`,
    );
    expect(confirmFirstUserResponse2.status).toEqual(HttpStatus.FOUND);
  });
  it('3 - POST:auth/login - 200 - login 1st & 2nd users', async () => {
    const { firstUser, secondUser } = expect.getState();

    const loginFirstUserResponse = await request(server)
      .post('/api/v1/auth/login')
      .set('user-agent', 'device-1')
      .send({
        email: firstUser.email,
        password: firstUser.password,
      });

    expect(loginFirstUserResponse.status).toEqual(HttpStatus.OK);
    expect(loginFirstUserResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const accessToken1 = loginFirstUserResponse.body.accessToken;
    const refreshToken1 = loginFirstUserResponse.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];

    const loginSecondUserResponse = await request(server)
      .post('/api/v1/auth/login')
      .set('user-agent', 'device-2')
      .send({
        email: secondUser.email,
        password: secondUser.password,
      });

    expect(loginSecondUserResponse.status).toEqual(HttpStatus.OK);
    expect(loginSecondUserResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const accessToken2 = loginSecondUserResponse.body.accessToken;
    const refreshToken2 = loginSecondUserResponse.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];

    expect.setState({
      accessToken1,
      accessToken2,
      refreshToken1,
      refreshToken2,
    });
  });
  it('4 - GET:auth/me - 200 - login 1st & 2nd users', async () => {
    const { accessToken1, accessToken2, firstUser, secondUser } =
      expect.getState();

    const loginFirstUserResponse = await request(server)
      .get('/api/v1/auth/me')
      .auth(accessToken1, { type: 'bearer' });

    expect(loginFirstUserResponse.status).toEqual(HttpStatus.OK);
    expect(loginFirstUserResponse.body).toEqual({
      login: firstUser.login,
      email: firstUser.email,
      userId: expect.any(Number),
    });

    const loginSecondUserResponse = await request(server)
      .get('/api/v1/auth/me')
      .auth(accessToken2, { type: 'bearer' });

    expect(loginSecondUserResponse.status).toEqual(HttpStatus.OK);
    expect(loginSecondUserResponse.body).toEqual({
      login: secondUser.login,
      email: secondUser.email,
      userId: expect.any(Number),
    });

    // expect.setState({ accessToken1, accessToken2 });
  });
  it('5 - POST:auth/logout - 200 - login 1st & 2nd users', async () => {
    const { accessToken1, accessToken2, refreshToken1, refreshToken2 } =
      expect.getState();
    // console.log({
    //   accessToken1,
    //   accessToken2,
    //   refreshToken1,
    //   refreshToken2,
    // });

    const logoutFirstUserResponse = await request(server)
      .post('/api/v1/auth/logout')
      // .auth(refreshToken1, { type: 'bearer' })
      .set('cookie', refreshToken1);
    // console.log({ refreshToken1 });

    expect(logoutFirstUserResponse).toBeDefined();
    expect(logoutFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const logoutSecondUserResponse = await request(server)
      .post('/api/v1/auth/logout')
      .auth(refreshToken1, { type: 'bearer' })
      .set('cookie', refreshToken2);

    expect(logoutSecondUserResponse).toBeDefined();
    expect(logoutSecondUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
});
