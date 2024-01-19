import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDescriptionModel } from '../api/models/create.description.model';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode, Services } from '../../../../../../libs/enums';
import { PostRepository } from '../infrastructure/post.repository';
import { ViewPostModel } from '../api/models/view.post.model';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

export class CreatePostCommand {
  constructor(
    public userId: number,
    public inputModel: CreateDescriptionModel,
    public files: Express.Multer.File[],
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postRepository: PostRepository,
    @Inject(Services.FileService) private client: ClientProxy,
  ) {}

  async execute(command: CreatePostCommand): Promise<ResultDTO<ViewPostModel>> {
    try {
      const { userId, inputModel, files } = command;

      // здесь сохраняем фотографии в s3 и получаем ссылки для поля imageUrl: string[]
      // cmd - команда для s3controller
      const postId = randomUUID();
      const savePostImagesResult: { fileId: string; key: string }[] =
        await lastValueFrom(
          this.client.send(
            { cmd: 'save_post_images' },
            { files: files, userId: userId, postId: postId },
          ),
        );

      // сюда надо положить массивы fileId и key
      const data = {
        id: postId,
        userId,
        description: inputModel.description,
        fileId: savePostImagesResult.map((file) => file.fileId),
        key: savePostImagesResult.map((file) => file.key),
      };
      const createPostResult = await this.postRepository.createPost(data);

      return new ResultDTO(InternalCode.Success, createPostResult.payload);
    } catch (e) {
      console.log({ e_1: e });
      return new ResultDTO(InternalCode.Internal_Server);
    }
  }
}
