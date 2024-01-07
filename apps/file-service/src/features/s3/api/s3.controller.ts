import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { SaveAvatarCommand } from '../application/use-cases/save-avatar.use-case';
import { DeleteAvatarCommand } from '../application/use-cases/delete-avatar.use-case';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';

//TODO сделать общение между слоями только контрактами
@Controller()
export class S3Controller {
  constructor(private commandBus: CommandBus) {}

  @MessagePattern({ cmd: 'save_avatar' })
  async saveAvatar(data: any) {
    const saveResult = await this.commandBus.execute(
      new SaveAvatarCommand(data.file, data.userId),
    );

    return saveResult;
  }

  @MessagePattern({ cmd: 'delete_avatar' })
  async deleteAvatar(data: any): Promise<ResultDTO<null>> {
    return this.commandBus.execute(new DeleteAvatarCommand(data.fileId));
  }
}
