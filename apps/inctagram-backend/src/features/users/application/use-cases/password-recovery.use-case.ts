import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { EmailEvents, InternalCode } from '../../../../../../../libs/enums';
import { add } from 'date-fns';
import { v4 as uuidV4 } from 'uuid';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<ResultDTO<null>> {
    const userResult = await this.usersRepository.findByCredentials(
      command.email,
    );
    if (userResult.code === InternalCode.NotFound)
      return new ResultDTO(InternalCode.Success);

    const newCode = uuidV4();
    const expirationDate = add(new Date(), { hours: 3 });

    const createRecoveryDataResult =
      await this.usersRepository.createOrUpdateRecoveryData(
        userResult.payload.id,
        expirationDate,
        newCode,
      );
    if (createRecoveryDataResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    return this.commandBus.execute(
      new DoOperationCommand(
        EmailEvents.Recover_password,
        command.email,
        createRecoveryDataResult.payload.recoveryCode,
      ),
    );
  }
}
