import { Express } from 'express';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AvatarRepository } from '../../infrastructure/avatar.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';

export class SaveAvatarCommand {
  constructor(public file: Express.Multer.File) {}
}

@CommandHandler(SaveAvatarCommand)
export class SaveAvatarUseCase implements ICommandHandler<SaveAvatarCommand> {
  constructor(private avatarRepository: AvatarRepository) {}

  async execute(command: SaveAvatarCommand) {
    const savedResult = await this.avatarRepository.save(command.file);
    if (savedResult.hasError()) return savedResult as ResultDTO<null>;
  }
}
