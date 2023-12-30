import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;

  constructor() {
    const REGION = 'us-east-1';

    this.s3Client = new S3Client({
      region: REGION,
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async saveAvatar(userId: number, originalName: string, buffer: Buffer) {
    const key = `content/users/${userId}/avatars/${userId}_avatar.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);
      console.log('Result Upload: ', uploadResult);
      return true;
    } catch (e) {
      console.error(e);
    }
  }
}
