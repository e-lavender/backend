import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Express } from 'express';
import { S3Adapter } from '../../adapter/s3.adapter';
import { File, FileModelType } from '../../domain/s3.entity';
import { FileTypeEnum } from '../../../../../enums';
import { S3Repository } from '../../infrastructure/s3.repository';
import { InjectModel } from '@nestjs/mongoose';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';

export class SaveAvatarCommand {
  constructor(public img: Express.Multer.File, public userId: string) {}
}

@CommandHandler(SaveAvatarCommand)
export class SaveAvatarUseCase implements ICommandHandler<SaveAvatarCommand> {
  constructor(
    private s3Adapter: S3Adapter,
    private s3Repository: S3Repository,
    @InjectModel(File.name) private FileModel: FileModelType,
  ) {}
  async execute(
    command: SaveAvatarCommand,
  ): Promise<ResultDTO<{ fileId: string; key: string }>> {
    const avatarResult = await this.s3Repository.findByUserId(+command.userId);
    if (avatarResult.hasError()) return avatarResult as ResultDTO<null>;
    await avatarResult.payload.deleteOne();

    const saveResult = await this.s3Adapter.saveAvatar(
      +command.userId,
      command.img.buffer,
      command.img.mimetype,
    );
    if (saveResult.hasError()) return saveResult as ResultDTO<null>;

    const metadata = command.img;
    delete metadata.buffer;

    const file = this.FileModel.makeInstance(
      saveResult.payload.data.ETag,
      +command.userId,
      FileTypeEnum.Img,
      saveResult.payload.key,
      metadata,
      this.FileModel,
    );

    return this.s3Repository.save(file);
  }
}
