import { GlobalConfigService } from './config/config.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../../libs/filters/exception.filter';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createWriteStream } from 'fs';
import { get } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(GlobalConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        const customErrors = errors.map((err) => {
          return {
            field: err.property,
            messages: Object.values(err.constraints),
          };
        });
        throw new BadRequestException(customErrors);
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  app.enableCors();
  app.use(cookieParser());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Inctagram(Flying Merch)')
    .setVersion('1.0')
    .addTag('Auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/swagger', app, document);

  const port = configService.getPort('users');
  await app.listen(port);
  console.log('Server running on port:', port);

  if (process.env.NODE_ENV === 'development') {
    // write swagger ui files
    get(
      `${process.env.DOMAIN}swagger/swagger-ui-bundle.js`,
      function (response) {
        response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
        console.log(
          `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
        );
      },
    );

    get(`${process.env.DOMAIN}swagger/swagger-ui-init.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
      console.log(
        `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
      );
    });

    get(
      `${process.env.DOMAIN}swagger/swagger-ui-standalone-preset.js`,
      function (response) {
        response.pipe(
          createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
        );
        console.log(
          `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
        );
      },
    );

    get(`${process.env.DOMAIN}swagger/swagger-ui.css`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
      console.log(
        `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
      );
    });
  }
}
bootstrap();
