import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { appSettings } from '../src/config/app.settings';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    server = app.getHttpServer();
    // await CleanDbService.cleanDb();
  });

  it('1 - POST:auth/registration - 204 - register 1st user', async () => {
    const firstUser = {
      login: `userName3`,
      email: `email3@gmail.com`,
      password: 'Qwertyuiop1!3',
    };
    const secondUser = {
      login: `userName2`,
      email: `email2@gmail.com`,
      password: 'Qwerty2',
    };

    // const firstUser = {
    //   login: `login${randomUUID().slice(0, 6)}`,
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

    // expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);

    expect.setState({ firstUser, secondUser });
  });
  // it('2 - POST:auth/registration-confirmation - 204 - confirm email', async () => {
  //   const registerFirstUserResponse = await request(server)
  //     .post('/auth/registration-confirmation')
  //     .send({ code: '' });
  //   // откуда забирать confirmationCode?
  //
  //   expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  // });
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
    const accessToken = loginFirstUserResponse.body.accessToken;

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

    expect.setState({ accessToken, accessToken2 });
  });

  // it('4 - GET:profile - 200 - getting raw profile', async () => {
  //   const { firstUser, accessToken } = expect.getState();
  //
  //   const registerFirstUserResponse = await request(server)
  //     .get('/api/v1/profile')
  //     .auth(accessToken, { type: 'bearer' });
  //
  //   expect(registerFirstUserResponse.status).toEqual(HttpStatus.OK);
  //   expect(registerFirstUserResponse.body).toEqual({
  //     userName: firstUser.login,
  //     firstName: null,
  //     lastName: null,
  //     dateOfBirth: null,
  //     city: null,
  //     country: null,
  //     aboutMe: null,
  //   });
  // });
  it('5 - PUT:profile - 400 - try to update profile without firstName', async () => {
    const { firstUser, accessToken } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: 'correctLastName',
        // firstName: '123',
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  it('6 - PUT:profile - 400 - try to update profile without lastName', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        // lastName: '123',
        firstName: 'correctFistName',
      });

    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
  });
  it('7 - PUT:profile - 400 - try to update profile with incorrect format of dateOfBirth', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        // userName: firstUser.login,
        userName: firstUser.login,
        lastName: 'correctLastName',
        firstName: 'correctFistName',
        dateOfBirth: 'invalid_type_of_data',
      });

    console.log({ t_7: registerFirstUserResponse.body.errorsMessages });
    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(registerFirstUserResponse.body.errorsMessages[0].field).toEqual(
      'dateOfBirth',
    );
  });
  it('8 - PUT:profile - 204 - update profile with correct data', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: 'correctLastName',
        firstName: 'correctFistName',
        dateOfBirth: new Date().toISOString(),
        city: 'correct_city',
        aboutMe: 'correct_about_me',
      });

    console.log({ t_8: registerFirstUserResponse.body.errorsMessages });
    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('9 - PUT:profile - 204 - update profile with empty fields', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const registerFirstUserResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        firstName: 'correctFistName',
        lastName: 'correctLastName',
        // dateOfBirth: '',
        city: '',
        country: '',
        aboutMe: '',
      });

    console.log({ t_9: registerFirstUserResponse.body.errorsMessages });
    expect(registerFirstUserResponse).toBeDefined();
    expect(registerFirstUserResponse.status).toEqual(HttpStatus.NO_CONTENT);
  });
  it('10 - PUT:profile - 204 - update userName', async () => {
    const { accessToken1 } = expect.getState();

    const updateFirstUserProfile = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: 'otherUserName',
        firstName: 'correctFistName',
        lastName: 'correctLastName',
        // dateOfBirth: '',
        city: '',
        country: '',
        aboutMe: '',
      });

    console.log({ t_10: updateFirstUserProfile.body.errorsMessages });
    expect(updateFirstUserProfile).toBeDefined();
    expect(updateFirstUserProfile.status).toEqual(HttpStatus.NO_CONTENT);

    const getFirstUserProfile = await request(server)
      .get('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' });
    expect(getFirstUserProfile.status).toEqual(HttpStatus.OK);
    expect(getFirstUserProfile.body).toEqual({
      userName: 'otherUserName',
      firstName: 'correctFistName',
      lastName: 'correctLastName',
      dateOfBirth: expect.any(String),
      city: '',
      country: '',
      aboutMe: '',
    });
  });
  // todo - попробовать обновить занятый кем-то userName
});
