import {
  HttpStatus,
  INestApplication,
  INestMicroservice,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../../../libs/core/app.settings';
import * as request from 'supertest';
import { CleanDbService } from './utils/clean.db.service';
import { PrismaService } from '../../../prisma/prisma.service';
import path from 'path';
import { FileServiceModule } from '../../file-service/src/file-service.module';
import { getConfiguration } from '../../file-service/config/configuration';
import { TcpOptions, Transport } from '@nestjs/microservices';

describe('PublicProfileAndPostController (e2e)', () => {
  let app: INestApplication;
  let fileApp: INestMicroservice;
  let server: any;

  beforeAll(async () => {
    // подключение основного приложеиня
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app, AppModule);
    await app.init();
    server = app.getHttpServer();

    // подключение файлового микросервиса
    const fileModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [FileServiceModule],
    }).compile();

    const config = getConfiguration();
    fileApp = fileModuleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: config.services.file.host,
        port: +config.services.file.port,
      },
    } as TcpOptions);
    await fileApp.init();

    // очистка БД
    const cleanDb = new CleanDbService(new PrismaService());
    await cleanDb.deletePosts();
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

  it('4 - 1st user update profile & create 2 posts', async () => {
    const { firstUser, accessToken1 } = expect.getState();

    const correctUpdateFirstProfile = {
      lastName: 'firstCorrectLastName',
      firstName: 'firstCorrectFistName',
      dateOfBirth: new Date().toISOString(),
      city: 'firstCorrect_City',
      country: 'firstCorrect_Country',
      aboutMe: 'firstCorrect_About_me',
    };
    const firstPostInput = {
      description: 'first_correct_description',
    };
    const secondPostInput = {
      description: 'second_correct_description',
    };

    // const filePath2 = path.resolve(__dirname, 'files', 'correct_img.jpg');
    const filePath =
      '/Users/artyom/Documents/IT/Incubator/inctagram/backend/apps/inctagram-backend/test/files/correct_img.jpg';

    const updateFirstProfileResponse = await request(server)
      .put('/api/v1/profile')
      .auth(accessToken1, { type: 'bearer' })
      .send({
        userName: firstUser.login,
        lastName: correctUpdateFirstProfile.lastName,
        firstName: correctUpdateFirstProfile.firstName,
        dateOfBirth: correctUpdateFirstProfile.dateOfBirth,
        city: correctUpdateFirstProfile.city,
        country: correctUpdateFirstProfile.country,
        aboutMe: correctUpdateFirstProfile.aboutMe,
      });

    console.log({ t_4: updateFirstProfileResponse.body.errorsMessages });
    expect(updateFirstProfileResponse).toBeDefined();
    expect(updateFirstProfileResponse.status).toEqual(HttpStatus.NO_CONTENT);

    const createFirstPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      .field('description', firstPostInput.description)
      .attach('files', filePath)
      .attach('files', filePath);

    expect(createFirstPostsResponse).toBeDefined();
    expect(createFirstPostsResponse.status).toEqual(HttpStatus.CREATED);
    expect(createFirstPostsResponse.body).toEqual({
      id: expect.any(String),
      description: firstPostInput.description,
      createdAt: expect.any(String),
      imageUrl: expect.any(Array),
    });

    const createSecondPostsResponse = await request(server)
      .post('/api/v1/post')
      .auth(accessToken1, { type: 'bearer' })
      .field('description', secondPostInput.description)
      .attach('files', filePath);

    expect(createSecondPostsResponse).toBeDefined();
    expect(createSecondPostsResponse.status).toEqual(HttpStatus.CREATED);
    expect(createSecondPostsResponse.body).toEqual({
      id: expect.any(String),
      description: secondPostInput.description,
      createdAt: expect.any(String),
      imageUrl: expect.any(Array),
    });

    expect.setState({
      correctUpdateFirstProfile,
      firstPost: createFirstPostsResponse.body,
      secondPost: createSecondPostsResponse.body,
    });
  });

  it('5 - GET:public/profile/:userName - 200 - get public profile by link', async () => {
    const { firstUser, correctUpdateFirstProfile, firstPost, secondPost } =
      expect.getState();

    const getFirstUserPublicProfile = await request(server).get(
      `/api/v1/public/profile/${firstUser.login}`,
    );

    expect(getFirstUserPublicProfile).toBeDefined();
    expect(getFirstUserPublicProfile.status).toEqual(HttpStatus.OK);
    expect(getFirstUserPublicProfile.body).toEqual({
      userName: firstUser.login,
      following: 0,
      followers: 0,
      postsCount: 2,
      aboutMe: correctUpdateFirstProfile.aboutMe,
      posts: {
        pagesCount: 1,
        currentPage: 1,
        pageSize: 8,
        itemsCount: 2,
        items: [secondPost, firstPost],
      },
    });
  });
  it('6 - GET:public/post/:postId - 200 - get public post by link', async () => {
    const { firstUser, firstPost, secondPost } = expect.getState();

    const getFirstPublicPost = await request(server).get(
      `/api/v1/public/posts/${firstPost.id}`,
    );

    expect(getFirstPublicPost).toBeDefined();
    expect(getFirstPublicPost.status).toEqual(HttpStatus.OK);
    expect(getFirstPublicPost.body).toEqual({
      userName: firstUser.login,
      imageUrl: firstPost.imageUrl,
      description: firstPost.description,
      comments: [],
    });

    const getSecondPublicPost = await request(server).get(
      `/api/v1/public/posts/${secondPost.id}`,
    );

    expect(getSecondPublicPost).toBeDefined();
    expect(getSecondPublicPost.status).toEqual(HttpStatus.OK);
    expect(getSecondPublicPost.body).toEqual({
      userName: firstUser.login,
      imageUrl: secondPost.imageUrl,
      description: secondPost.description,
      comments: [],
    });

    expect.setState({
      firstPublicPost: getFirstPublicPost.body,
      secondPublicPost: getSecondPublicPost.body,
    });
  });

  it('7 - GET:public/posts - 200 - get public profile by link', async () => {
    const { secondPublicPost, firstPublicPost } = expect.getState();

    const getPublicMainPage = await request(server).get('/api/v1/public/posts');

    expect(getPublicMainPage).toBeDefined();
    expect(getPublicMainPage.status).toEqual(HttpStatus.OK);
    expect(getPublicMainPage.body).toEqual({
      usersCount: expect.any(Number),
      lastPosts: [secondPublicPost, firstPublicPost],
    });
  });
});
