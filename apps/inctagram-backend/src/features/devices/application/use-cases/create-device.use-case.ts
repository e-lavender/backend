import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { DevicesRepository } from '../../infrastructure/devices.repository';

export class CreateDeviceCommand {
  constructor(
    public userId: number,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase
  implements ICommandHandler<CreateDeviceCommand>
{
  constructor(private devicesRepository: DevicesRepository) {}

  async execute(
    command: CreateDeviceCommand,
  ): Promise<ResultDTO<{ deviceId: string }>> {
    return this.devicesRepository.create(
      command.userId,
      command.ip,
      command.deviceName,
      new Date(),
    );
  }
}
