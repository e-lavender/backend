import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../../../libs/core/app.settings';
import * as request from 'supertest';

describe('PostController (e2e)', () => {
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
    // await CleanDbService.cleanDb();
  });

  it('1 - POST:auth/registration - 204 - register 1st & 2nd users', async () => {
    const firstUser = {
      login: `userName3`,
      email: `email3@gmail.com`,
      password: 'Qwertyuiop1!3',
    };
    const secondUser = {
      login: `userName2`,
      email: `email2@gmail.com`,
      password: 'Qwerty2!',
    };

    // const firstUser = {
    //   login: `login${randomUUID().slice(0, 6)}`,
    //   email: `${randomUUID().slice(0, 6)}@gmail.com`,
    //   password: 'q',
    // };

    // const registerFirstUserResponse = await request(server)
    //   .post('/api/v1/auth/registration')
    //   .send({
    //     login: secondUser.login,
    //     email: secondUser.email,
    //     password: secondUser.password,
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
    const accessToken1 = loginFirstUserResponse.body.accessToken;

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

    expect.setState({ accessToken1, accessToken2 });
  });

  it('4 - GET:post - 200 - 1st user get himself posts', async () => {
    const { accessToken1 } = expect.getState();

    const getPostsResponse = await request(server)
      .get('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' });

    console.log(getPostsResponse.body);
    expect(getPostsResponse).toBeDefined();
    expect(getPostsResponse.status).toEqual(HttpStatus.OK);
    expect(getPostsResponse.body).toEqual([]);
  });
  it('5 - POST:post - 200 - 1st user create 2 posts', async () => {
    const { accessToken1 } = expect.getState();
    const firstPostInput = {
      description: 'first_correct_description',
    };
    const secondPostInput = {
      description: 'second_correct_description',
    };

    const createFirstPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        description: firstPostInput.description,
      });

    expect(createFirstPostsResponse).toBeDefined();
    expect(createFirstPostsResponse.status).toEqual(HttpStatus.CREATED);
    expect(createFirstPostsResponse.body).toEqual({
      id: expect.any(String),
      description: firstPostInput.description,
      createdAt: expect.any(String),
    });

    const createSecondPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        description: secondPostInput.description,
      });

    expect(createSecondPostsResponse).toBeDefined();
    expect(createSecondPostsResponse.status).toEqual(HttpStatus.CREATED);
    expect(createSecondPostsResponse.body).toEqual({
      id: expect.any(String),
      description: secondPostInput.description,
      createdAt: expect.any(String),
    });

    expect.setState({
      firstPost: createFirstPostsResponse.body,
      secondPost: createSecondPostsResponse.body,
    });
  });
  // it('6 - PUT:post - 200 - 1st user update 2 posts', async () => {
  //   const { accessToken1, firstPost, secondPost } = expect.getState();
  //   const firstPostInput = {
  //     description: 'updated_first_correct_description',
  //   };
  //   const secondPostInput = {
  //     description: 'updated_second_correct_description',
  //   };
  //
  //   const createFirstPostsResponse = await request(server)
  //     .put(`/api/v1/post/${firstPost.id}`)
  //     .auth(accessToken1, { type: 'bearer' })
  //     .send({
  //       description: firstPostInput.description,
  //     });
  //
  //   expect(createFirstPostsResponse).toBeDefined();
  //   expect(createFirstPostsResponse.status).toEqual(HttpStatus.NO_CONTENT);
  //   expect(createFirstPostsResponse.body).toEqual({});
  //
  //   const createSecondPostsResponse = await request(server)
  //     .put(`/api/v1/post/${secondPost.id}`)
  //     .auth(accessToken1, { type: 'bearer' })
  //     .send({
  //       description: secondPostInput.description,
  //     });
  //
  //   expect(createSecondPostsResponse).toBeDefined();
  //   expect(createSecondPostsResponse.status).toEqual(HttpStatus.NO_CONTENT);
  //   expect(createSecondPostsResponse.body).toEqual({});
  //
  //   expect.setState({
  //     firstPost: createFirstPostsResponse.body,
  //     secondPost: createSecondPostsResponse.body,
  //   });
  // });

  it('? - DELETE:post - 200 - 1st user delete 2 posts', async () => {
    const { accessToken1, firstPost, secondPost } = expect.getState();

    const deleteFirstPostResponse = await request(server)
      .delete(`/api/v1/post/${firstPost.id}`)
      .auth(accessToken1, { type: 'bearer' });

    expect(deleteFirstPostResponse).toBeDefined();
    expect(deleteFirstPostResponse.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteFirstPostResponse.body).toEqual({});

    const deleteSecondPostResponse = await request(server)
      .delete(`/api/v1/post/${secondPost.id}`)
      .auth(accessToken1, { type: 'bearer' });

    expect(deleteSecondPostResponse).toBeDefined();
    expect(deleteSecondPostResponse.status).toEqual(HttpStatus.NO_CONTENT);
    expect(deleteSecondPostResponse.body).toEqual({});
  });
});
