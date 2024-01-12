import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailEvents, InternalCode } from '../../../../../../../libs/enums';
import { DoOperationCommand } from '../../../email/application/use-cases/do-operation-use-case';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersQueryRepository } from '../../../users/infrastructure/users-query.repository';

export class ResendEmailConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ResendEmailConfirmationCommand)
export class ResendEmailConfirmationUseCase
  implements ICommandHandler<ResendEmailConfirmationCommand>
{
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: ResendEmailConfirmationCommand,
  ): Promise<ResultDTO<null>> {
    const userResult = await this.usersQueryRepository.findUserByConfirmCode(
      command.code,
    );
    if (userResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const expirationDate = add(new Date(), { hours: 3 });
    const newCode = uuidv4();

    const updateResult = await this.usersRepository.updateConfirmData(
      userResult.payload.id,
      expirationDate,
      newCode,
    );
    if (updateResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    return this.commandBus.execute(
      new DoOperationCommand(
        EmailEvents.Registration,
        userResult.payload.email,
        updateResult.payload.code,
      ),
    );
  }
}
