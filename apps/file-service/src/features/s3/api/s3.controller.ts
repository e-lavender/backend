import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { S3Adapter } from '../infrastructure/s3.adapter';

@Controller()
export class S3Controller {
  constructor(private s3Adapter: S3Adapter) {}

  @MessagePattern({ cmd: 'save_avatar' })
  async saveAvatar(data: any) {
    console.log(data);
    return this.s3Adapter.saveAvatar(
      data.userId,
      data.file.originalname,
      data.file.buffer,
    );
  }
}
