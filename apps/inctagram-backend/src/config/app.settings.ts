import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../../../libs/filters/exception.filter';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import { setupSwagger } from '../../../../swagger-static';
import { generateSwagger } from '../../../../swagger-static/generate';

export const appSettings = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
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
  app.enableCors({
    allowedHeaders: ['content-type', 'authorization'],
    origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      'https://freedomindz.site',
    ],
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  setupSwagger(app);
  generateSwagger();
};
