import { NestFactory } from '@nestjs/core';
import { FileServiceModule } from './file-service.module';
import {
  MicroserviceOptions,
  TcpOptions,
  Transport,
} from '@nestjs/microservices';
import { getConfiguration } from '../config/configuration';

async function bootstrap() {
  const config = getConfiguration();
  //TODO Добавить сюда специальный для микросервиса эксепшен
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: config.services.file.host,
        port: +config.services.file.port,
      },
    } as TcpOptions,
  );

  await app.listen();
}

bootstrap();
