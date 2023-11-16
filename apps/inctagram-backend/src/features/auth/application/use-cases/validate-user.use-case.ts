import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { compare } from 'bcrypt';
import { InternalCode } from '../../../../../../../libs/enums';

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
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ValidateUserCommand): Promise<ResultDTO<null>> {
    let passwordHash;

    if (!command.originalPasswordHash) {
      const userResult = await this.usersRepository.findByCredentials(
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
