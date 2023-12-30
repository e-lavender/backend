import { Module } from '@nestjs/common';
import { S3Controller } from './features/s3/api/s3.controller';
import { GlobalConfigService } from '../../config/config.service';
import { configModule } from '../../config/config.module';
import { S3Adapter } from './features/s3/infrastructure/s3.adapter';

@Module({
  imports: [configModule],
  controllers: [S3Controller],
  providers: [GlobalConfigService, S3Adapter],
})
export class FileServiceModule {}
