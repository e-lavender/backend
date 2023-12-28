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
    // await CleanDbService.cleanDb();
  });

  it('1 - POST:auth/registration - 204 - register new user', async () => {
    const firstUser = {
      login: `login-123`,
      email: `valid@gmail.com`,
      password: 'Valid-pass!',
    };

    // const firstUser = {
    //   login: `login-${randomUUID().slice(0, 6)}`,
    //   email: `${randomUUID().slice(0, 6)}@gmail.com`,
    //   password: 'q',
    // };

    // const registerFirstUserResponse = await request(server)
    //   .post('/auth/registration')
    //   .send({
    //     login: firstUser.login,
    //     email: firstUser.email,
    //     password: firstUser.password,
    //   });
    //
    // expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    expect.setState({ firstUser });
  });
  // it('2 - POST:auth/registration-confirmation - 204 - confirm email', async () => {
  //   const registerFirstUserResponse = await request(server)
  //     .post('/auth/registration-confirmation')
  //     .send({ code: '' });
  //   // откуда забирать confirmationCode?
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
      userName: firstUser.login,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      city: null,
      country: null,
      aboutMe: null,
    });
  });
  it('5 - PUT:profile - 400 - try to update profile without firstName', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/profile')
      .auth(accessToken, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: 'correct_last_name',
        // firstName: '123',
      });
    // todo - почему-то дает обновить профиль без firstName, так не должно быть - проблема в пайпе
    // либо пишем свой авйп для этой инпут модели, либо пишем один общий пайп, который будет ловить ошибки всех инпут моделей

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  it('6 - PUT:profile - 400 - try to update profile without lastName', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/profile')
      .auth(accessToken, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        // lastName: '123',
        firstName: 'correct_fist_name',
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  // it('7 - PUT:profile - 400 - try to update profile with incorrect format of dateOfBirth', async () => {
  //   const { firstUser, accessToken } = expect.getState();
  //
  //   const registerFirstUserResponse = await request(server)
  //     .put('/profile')
  //     .auth(accessToken, { type: 'bearer' })
  //     .send({
  //       login: firstUser.login,
  //       lastName: 'correct_last_name_1',
  //       firstName: 'correct_fist_name',
  //       dateOfBirth: 'invalid_type_of_data',
  //     });
  //
  //   expect(registerFirstUserResponse).toBeDefined();
  //   expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  // });
  it('8 - PUT:profile - 204 - update profile', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/profile')
      .auth(accessToken, { type: 'bearer' })
      .send({
        login: firstUser.login,
        lastName: 'correct_last_name_1',
        firstName: 'correct_fist_name_1',
        dateOfBirth: new Date(),
        city: 'correct_city',
        aboutMe: 'correct_about_me',
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('9 - PUT:profile - 204 - update profile with empty fields', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/profile')
      .auth(accessToken, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: 'correct_last_name_1',
        // lastName: null,
        firstName: 'correct_fist_name_1',
        dateOfBirth: null,
        city: null,
        country: null,
        aboutMe: null,
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
});
