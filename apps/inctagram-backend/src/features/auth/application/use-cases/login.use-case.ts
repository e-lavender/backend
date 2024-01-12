import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { ValidateUserCommand } from './validate-user.use-case';
import { CreateDeviceCommand } from '../../../devices/application/use-cases/create-device.use-case';
import { JwtService } from '@nestjs/jwt';
import { UsersQueryRepository } from '../../../users/infrastructure/users-query.repository';

export class LoginCommand {
  constructor(
    public email: string,
    public password: string,
    public deviceName: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private jwtService: JwtService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<ResultDTO<{ accessToken: string; refreshToken: string }>> {
    const userResult = await this.usersQueryRepository.findByCredentials(
      command.email,
    );
    if (userResult.hasError()) return new ResultDTO(InternalCode.Unauthorized);

    const validationResult = await this.commandBus.execute(
      new ValidateUserCommand(
        command.email,
        command.password,
        userResult.payload.passwordHash,
      ),
    );
    if (validationResult.hasError()) return validationResult;

    const createDeviceResult = await this.commandBus.execute(
      new CreateDeviceCommand(
        userResult.payload.id,
        command.ip,
        command.deviceName,
      ),
    );
    if (createDeviceResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const accessToken = await this.jwtService.signAsync(
      { userId: userResult.payload.id },
      { expiresIn: '30m' },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        userId: userResult.payload.id,
        deviceId: createDeviceResult.payload.deviceId,
      },
      { expiresIn: '200m' },
    );

    return new ResultDTO(InternalCode.Success, { accessToken, refreshToken });
  }
}
