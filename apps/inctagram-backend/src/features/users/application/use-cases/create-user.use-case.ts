import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { Prisma } from '@prisma/client';
import { GlobalConfigService } from '../../../../../config/config.service';
import { genSalt, hash } from 'bcrypt';
import { UsersRepository } from '../../infrastructure/users.repository';
import { InternalCode } from '../../../../../../../libs/enums';
import { add } from 'date-fns';

export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private configService: GlobalConfigService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    command: CreateUserCommand,
  ): Promise<ResultDTO<{ userId: number; code: string }>> {
    const round = this.configService.getSalt();
    const passwordSalt = await genSalt(round);
    const passwordHash = await hash(command.password, passwordSalt);

    const data: Prisma.UserCreateInput = {
      login: command.login,
      email: command.email,
      passwordHash: passwordHash,
    };
    const expirationDate = add(new Date(), { hours: 3 });
    console.log({ exp_date_before_db: expirationDate });

    const userResult = await this.usersRepository.createUser(
      data,
      expirationDate,
    );

    return new ResultDTO(InternalCode.Success, userResult.payload);
  }
}
