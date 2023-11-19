import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { DeleteDeviceCommand } from '../../../devices/application/use-cases/delete-device.use-case';

export class LogoutCommand {
  constructor(
    public userId: number,
    public deviceId: string,
    public iat: number,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private commandBus: CommandBus,
    private devicesRepository: DevicesRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<ResultDTO<null>> {
    const deviceResult = await this.devicesRepository.findDevice(
      command.deviceId,
    );
    if (deviceResult.hasError())
      return new ResultDTO(InternalCode.Unauthorized);

    if (
      deviceResult.payload.userId !== command.userId ||
      command.iat !== Math.trunc(+deviceResult.payload.issuedAt / 1000)
    )
      return new ResultDTO(InternalCode.Unauthorized);

    return this.commandBus.execute(new DeleteDeviceCommand(command.deviceId));
  }
}
