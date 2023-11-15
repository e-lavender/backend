import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { genSalt, hash } from 'bcrypt';
import { GlobalConfigService } from '../../../../config/config.service';
import { sub } from 'date-fns';

export class UpdatePasswordCommand {
  constructor(public code: string, public newPassword: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private configService: GlobalConfigService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<ResultDTO<null>> {
    const recoveryDataResult = await this.usersRepository.findRecoveryData(
      command.code,
    );
    if (recoveryDataResult.hasError())
      return new ResultDTO(InternalCode.Internal_Server);

    const round = this.configService.getSalt();
    const passwordSalt = await genSalt(round);
    const passwordHash = await hash(command.newPassword, passwordSalt);

    //TODO add transaction
    //TODO refactor clean recoveryCode logic
    await this.usersRepository.updatePassword(
      recoveryDataResult.payload.userId,
      passwordHash,
    );

    await this.usersRepository.createOrUpdateRecoveryData(
      recoveryDataResult.payload.userId,
      sub(new Date(), { days: 1 }),
      recoveryDataResult.payload.recoveryCode,
    );

    return new ResultDTO(InternalCode.Success);
  }
}
