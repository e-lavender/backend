import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { compare } from 'bcrypt';
import { InternalCode } from '../../../../../../../libs/enums';
import { UsersQueryRepository } from '../../../users/infrastructure/users-query.repository';

export class ValidateUserCommand {
  constructor(
    public email: string,
    public password: string,
    public originalPasswordHash?: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute(command: ValidateUserCommand): Promise<ResultDTO<null>> {
    let passwordHash;

    if (!command.originalPasswordHash) {
      const userResult = await this.usersQueryRepository.findByCredentials(
        command.email,
      );
      if (userResult.hasError()) return userResult as ResultDTO<null>;

      passwordHash = userResult.payload.passwordHash;
    } else {
      passwordHash = command.originalPasswordHash;
    }

    const isValidUser = await compare(command.password, passwordHash);

    if (!isValidUser) return new ResultDTO(InternalCode.Unauthorized);

    return new ResultDTO(InternalCode.Success);
  }
}
