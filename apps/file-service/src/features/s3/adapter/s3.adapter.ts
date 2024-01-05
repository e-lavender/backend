import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
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

  async saveAvatar(
    userId: number,
    buffer: Buffer,
    mimetype: string,
  ): Promise<{ key: string; data: PutObjectCommandOutput }> {
    const key = `content/users/${userId}/avatars/${userId}_avatar.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);
      return { key, data: uploadResult };
    } catch (e) {
      console.error(e);
    }
  }

  async deleteAvatar(userId: number): Promise<any> {
    const key = `content/users/${userId}/avatars/${userId}_avatar.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
    };

    const command = new DeleteObjectCommand(bucketParams);

    try {
      return await this.s3Client.send(command);
    } catch (e) {
      console.error(e);
    }
  }
}
