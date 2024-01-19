import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3Repository } from '../../infrastructure/s3.repository';
import { S3Adapter } from '../../adapter/s3.adapter';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';

export class DeletePostImagesCommand {
  constructor(public fileId: string[]) {}
}

@CommandHandler(DeletePostImagesCommand)
export class DeletePostImagesUseCase
  implements ICommandHandler<DeletePostImagesCommand>
{
  constructor(
    private s3Adapter: S3Adapter,
    private s3Repository: S3Repository,
  ) {}

  async execute(command: DeletePostImagesCommand): Promise<any> {
    const deletePostImagesResult = Promise.all(
      command.fileId.map(async (fileId) => {
        const image = await this.s3Repository.findById(fileId);
        if (image.hasError()) return image as ResultDTO<null>;

        try {
          await image.payload.deleteOne();
        } catch (e) {
          return new ResultDTO(InternalCode.Internal_Server);
        }

        return this.s3Adapter.deletePostImage(image.payload.key);
      }),
    );

    return deletePostImagesResult;
  }
}
