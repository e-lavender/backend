import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../manager/email.manager';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { EmailEvents, InternalCode } from '../../../../../../../libs/enums';

export class DoOperationCommand {
  constructor(
    public event: EmailEvents,
    public email: string,
    public code: string,
  ) {}
}

@CommandHandler(DoOperationCommand)
export class DoOperationUseCase implements ICommandHandler<DoOperationCommand> {
  constructor(private emailManager: EmailManager) {}

  async execute(command: DoOperationCommand): Promise<ResultDTO<null>> {
    let sendResult: ResultDTO<null>;

    switch (command.event) {
      case EmailEvents.Registration:
        sendResult = await this.emailManager.sendEmailRegistrationMessage(
          command.email,
          command.code,
        );
        break;
      case EmailEvents.Recover_password:
        sendResult = await this.emailManager.sendEmailRecoverPasswordMessage(
          command.email,
          command.code,
        );
      default:
        sendResult = new ResultDTO(InternalCode.Internal_Server);
        break;
    }

    return new ResultDTO(InternalCode.Success);
  }
}
