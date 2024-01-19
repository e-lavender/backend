import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';

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
  ): Promise<ResultDTO<{ key: string; data: PutObjectCommandOutput }>> {
    const key = `content/users/${userId}/avatars/${uuidv4()}_avatar.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success, { key, data: uploadResult });
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }

  async deleteAvatar(key: string): Promise<any> {
    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
    };

    const command = new DeleteObjectCommand(bucketParams);

    try {
      await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success);
    } catch (e) {
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }

  async savePostImages(
    userId: number,
    postId: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<ResultDTO<{ key: string; data: PutObjectCommandOutput }>> {
    const key = `content/users/${userId}/posts/${postId}/${uuidv4()}_image.png`;

    const bucketParams = {
      Bucket: 'inctagram1',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const saveResult = await this.s3Client.send(command);
      return new ResultDTO(InternalCode.Success, { key, data: saveResult });
    } catch (e) {
      console.log({ e_2: e });
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }
}
