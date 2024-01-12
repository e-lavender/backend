import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ExceptionAndResponseHelper } from '../../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../../libs/enums';
import { CommandBus } from '@nestjs/cqrs';
import { GlobalConfigService } from '../../../../../config/config.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as process from 'process';
import { Response } from 'express';
import fetch from 'nodemailer/lib/fetch';
import axios from 'axios';

@ApiTags('OAuth2')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class Oauth2Controller extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private configService: GlobalConfigService,
  ) {
    super(ApproachType.http);
  }

  @Get('google')
  async signInByGoogle() {}

  @Get('github')
  async signInByGithub(@Res() res: Response) {
    // если мы дергаем этот эндпоинт:
    // сначала нас перенапрвляет на гитхаб GET
    const getCodeUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${process.env.CLIENT_ID}`;
    // этот эндпоинт принимает следующие параметры:
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: 'указать какую-то домашнюю страницу', // куда пользователи будут отправлены после нажатия конпки "авторизоваться" на гитхабе
      scope: 'user',
      state: '', // приходит по GET запросу
      allow_signup: true,
    };
    // там мы нажимаем на кнопку

    // затем гитхаб дает нам code и направляет сюда
    const someUrl = `https://github.com/login/oauth/authorize?code=CDCDCDCDC`;
    // code действует 10 минут - за это время надо дернуть следуюший эндпоинт
    // чтобы обменять code на access_token
    const postMethod = 'https://github.com/login/oauth/access_token';

    // этот эндпоинт принимает следующие параметры в body:
    const body = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: '', // этот код надо получить из предыдущего запроса
      redirect_uri: '', // в вашем приложении, куда пользователи будут отправлены - опционально
    };
    // и отправляет в ответ вот такие параметры:
    const req_body = {
      access_token: '', // здесь наш access_token, который мы будес использовать дальше
      scope: 'user',
      token_type: 'bearer',
    };
    const headers = { Accept: 'application/json' };

    // используем полученный access_token, чтобы делать запросы в github API от имени пользователя по следующей ссылке
    // GET https://api.github.com/user  Authorization: Bearer OAUTH-TOKEN

    const authorization_base_url = 'https://github.com/login/oauth/authorize';
    const token_url = 'https://github.com/login/oauth/access_token';

    return res.redirect(getCodeUrl);
  }

  @Post('github/callback')
  async redirectGithub(@Query('code') code: string, @Res() res: Response) {
    const body = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code, // todo - этот код должен быть отправлен с фронтенда
    };
    const postMethod = 'https://github.com/login/oauth/access_token';
    fetch(postMethod);
    return res.redirect(postMethod);
  }

  @Get('github/callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      const result = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: '33a703d019e0d23730ea',
          client_secret: '6f52b07d679f6955317a4fe7983d4b3b6cb0aa2e',
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      console.log(result.data.access_token);
      return res.send('you are authorized ' + result.data.access_token);
    } catch (e) {
      console.error(e);
    }
  }

  // @Get('callback')
  // async callback2(
  //   @Query('code') code: string,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const result = await this.httpServer
  //       .post('https://github.com/login/oauth/access_token', {
  //         client_id: '33a703d019e0d23730ea',
  //         client_secret: '6f52b07d679f6955317a4fe7983d4b3b6cb0aa2e',
  //         code,
  //       })
  //       .toPromise();
  //     console.log(result.data.access_token);
  //     return res.send('you are authorized ' + result.data.access_token);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
}
