import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDescriptionModel } from '../api/models/create.description.model';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';
import { PostRepository } from '../infrastructure/post.repository';
import { ViewPostModel } from '../api/models/view.post.model';

export class CreatePostCommand {
  constructor(
    public userId: number,
    public inputModel: CreateDescriptionModel,
    public files: Array<Express.Multer.File> | any,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postRepository: PostRepository) {}

  async execute(command: CreatePostCommand): Promise<ResultDTO<ViewPostModel>> {
    const { userId, inputModel, files } = command;
    // здесь сохраняем фотогрвфии в отдельное хранилище и получаем ссылку для поля photosUrl

    const data = {
      userId,
      description: inputModel.description,
      photoUrl: 'mock_inputModel.photoUrl',
    };
    const createPostResult = await this.postRepository.createPost(data);

    if (createPostResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success, createPostResult.payload);
    }
  }
}
