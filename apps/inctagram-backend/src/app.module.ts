import { configModule } from './config/config.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CqrsModule } from '@nestjs/cqrs';
import { GlobalConfigService } from './config/config.service';

const services = [GlobalConfigService, AppService];

@Module({
  imports: [CqrsModule, configModule],
  controllers: [AppController],
  providers: [...services],
})
export class AppModule {}
