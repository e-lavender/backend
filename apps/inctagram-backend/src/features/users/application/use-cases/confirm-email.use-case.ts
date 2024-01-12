import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { isAfter } from 'date-fns';

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

    console.log({
      code_date_after_db: confirmDataResult.payload.expirationDate,
      current_date: new Date(),
    });
    if (isAfter(new Date(), confirmDataResult.payload.expirationDate))
      return new ResultDTO(InternalCode.Expired);

    return this.usersRepository.confirmEmail(confirmDataResult.payload.userId);
  }
}
