import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/devices.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';

export class UpdateSessionCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionUseCase
  implements ICommandHandler<UpdateSessionCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: UpdateSessionCommand): Promise<ResultDTO<null>> {
    const newIssuedAt = new Date();

    return this.devicesRepository.updateTime(command.deviceId, newIssuedAt);
  }
}
