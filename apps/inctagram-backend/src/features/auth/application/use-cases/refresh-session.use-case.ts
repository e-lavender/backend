import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository';
import { InternalCode } from '../../../../../../../libs/enums';
import { JwtService } from '@nestjs/jwt';
import { UpdateSessionCommand } from '../../../devices/application/use-cases/update-session.use-case';

export class RefreshSessionCommand {
  constructor(
    public userId: number,
    public deviceId: string,
    public iat: number,
  ) {}
}

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionUseCase
  implements ICommandHandler<RefreshSessionCommand>
{
  constructor(
    private jwtService: JwtService,
    private commandBus: CommandBus,
    private devicesRepository: DevicesRepository,
  ) {}

  async execute(
    command: RefreshSessionCommand,
  ): Promise<ResultDTO<{ accessToken: string; refreshToken: string }>> {
    const deviceResult = await this.devicesRepository.findDevice(
      command.deviceId,
    );
    if (deviceResult.hasError())
      return new ResultDTO(InternalCode.Unauthorized);

    if (
      command.userId !== deviceResult.payload.userId ||
      command.iat !== Math.trunc(+deviceResult.payload.issuedAt / 1000)
    )
      return new ResultDTO(InternalCode.Unauthorized);

    const updateSessionTime = await this.commandBus.execute(
      new UpdateSessionCommand(command.deviceId),
    );
    if (updateSessionTime.hasError()) return updateSessionTime;

    const accessToken = await this.jwtService.signAsync(
      { userId: command.userId },
      { expiresIn: '30m' },
    );

    const refreshToken = await this.jwtService.signAsync(
      { userId: command.userId, deviceId: command.deviceId },
      { expiresIn: '200m' },
    );

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }
}
