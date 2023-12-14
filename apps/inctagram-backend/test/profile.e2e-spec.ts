import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  it('1 - POST:auth/registration - 204 - register new user', async () => {
    const firstUser = {
      login: 'lg-1111',
      password: 'qwerty1',
      email: 'artyomgolubev1@gmail.com',
    };

    const registerFirstUserResponse = await request(server)
      .post('/auth/registration')
      .send({
        login: firstUser.login,
        password: firstUser.password,
        email: firstUser.email,
      });

    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    expect.setState({ firstUser });
  });
  // it('2 - POST:auth/registration-confirmation - 204 - confirm email', async () => {
  //   const registerFirstUserResponse = await request(server)
  //     .post('/auth/registration-confirmation')
  //     .send({ code: '' });
  //   // todo - откуда забирать confirmationCode?
  //
  //   expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  // });
  it('3 - POST:auth/login - 200 - login user', async () => {
    const { firstUser } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .post('/auth/login')
      .set('user-agent', 'device-1')
      .send({
        email: firstUser.email,
        password: firstUser.password,
      });

    expect(registerFirstUserResponse.status).toEqual(HttpStatus.OK);
    expect(registerFirstUserResponse.body).toEqual({
      accessToken: expect.any(String),
    });
    const accessToken = registerFirstUserResponse.body.accessToken;

    expect.setState({ accessToken });
  });

  it('4 - GET:profile - 200 - getting raw profile', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .get('/profile')
      .auth(accessToken, { type: 'bearer' });

    expect(registerFirstUserResponse.status).toEqual(HttpStatus.OK);
    expect(registerFirstUserResponse.body).toEqual({
      login: firstUser.login,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      city: null,
      aboutMe: null,
    });
  });
  it('5 - PUT:profile - 400 - try to update profile without firstName', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/profile')
      .auth(accessToken, { type: 'bearer' })
      .send({
        login: firstUser.login,
        lastName: '123',
        // firstName: '123',
      });
    // todo - почему-то дает обновить профиль без firstName, так не должно быть

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
});
