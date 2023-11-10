import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<ResultDTO<null>> {
    const confirmDataResult = await this.usersRepository.findConfirmData(
      command.code,
    );
    if (confirmDataResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    return this.usersRepository.confirmEmail(confirmDataResult.payload.userId);
  }
}
