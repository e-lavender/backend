import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { isAfter } from 'date-fns';

export class ConfirmPasswordRecoveryCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmPasswordRecoveryCommand)
export class ConfirmPasswordRecoveryUseCase
  implements ICommandHandler<ConfirmPasswordRecoveryCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    command: ConfirmPasswordRecoveryCommand,
  ): Promise<ResultDTO<{ code: string }>> {
    const recoveryDataResult = await this.usersRepository.findRecoveryData(
      command.code,
    );
    if (recoveryDataResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    if (isAfter(new Date(), recoveryDataResult.payload.expirationDate))
      return new ResultDTO(InternalCode.Expired, { code: command.code });

    return this.usersRepository.confirmRecoveryPassword(
      recoveryDataResult.payload.userId,
    );
  }
}
