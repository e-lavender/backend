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
  SwaggerModule.setup('/swagger', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  });

  const port = configService.getPort('users');
  await app.listen(port);
  console.log('Server running on port:', port);
}
bootstrap();
