import { GlobalConfigService } from './config/config.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from '../../../libs/core/app.settings';
import { generateSwagger } from '../../../swagger-static/generate';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings<AppModule>(app, AppModule);
  const configService = app.get(GlobalConfigService);
  const port = configService.getPort('users');
  await app.listen(port, () => {
    console.log(`App started at http://localhost:${port}`);
  });
  generateSwagger();
}
bootstrap();
