import { Express } from 'express';
import { Injectable } from '@nestjs/common';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';

@Injectable()
export class AvatarRepository {
  async save(
    file: Express.Multer.File,
  ): Promise<any> /*Promise<ResultDTO<{ url: string }>>*/ {}
}
