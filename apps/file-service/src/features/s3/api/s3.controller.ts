import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { SaveAvatarCommand } from '../application/use-cases/save-avatar.use-case';
import { DeleteAvatarCommand } from '../application/use-cases/delete-avatar.use-case';
import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../libs/enums';

@Controller()
export class S3Controller extends ExceptionAndResponseHelper {
  constructor(private commandBus: CommandBus) {
    super(ApproachType.tcp);
  }

  @MessagePattern({ cmd: 'save_avatar' })
  async saveAvatar(data: any): Promise<{ fileId: string; key: string }> {
    const saveResult = await this.commandBus.execute(
      new SaveAvatarCommand(data.file, data.userId),
    );

    return this.sendExceptionOrResponse(saveResult);
  }

  @MessagePattern({ cmd: 'delete_avatar' })
  async deleteAvatar(data: any): Promise<void> {
    const deleteResult = await this.commandBus.execute(
      new DeleteAvatarCommand(data.fileId),
    );

    return this.sendExceptionOrResponse(deleteResult);
  }
}
