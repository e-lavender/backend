import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/devices.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';

export class DeleteDeviceCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(command: DeleteDeviceCommand): Promise<ResultDTO<null>> {
    return this.devicesRepository.delete(command.deviceId);
  }
}
