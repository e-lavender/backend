import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileModel } from '../../api/models/update.profile.model';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';
import { ProfileQueryRepository } from '../../infrastructure/profile.query.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BadRequestException } from '@nestjs/common';

export class UpdateProfileCommand {
  constructor(public userId: number, public inputModel: UpdateProfileModel) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private profileRepository: ProfileRepository,
    private profileQueryRepository: ProfileQueryRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<ResultDTO<null>> {
    const { userId, inputModel } = command;
    const getProfileResult = await this.profileQueryRepository.getProfile(
      userId,
    );
    const isUserNameAvailable =
      await this.profileQueryRepository.getProfileByUserName(
        userId,
        inputModel.userName,
      );

    // если полученный userName занят, отправляем ошибку
    if (isUserNameAvailable.hasError()) {
      // todo - создать кастомный месседж, надо модернизировать exception filter
      throw new BadRequestException('userName already exist=>userName');
    }

    // если полученный userName НЕ совпадает с текущим, обновляем его
    if (inputModel.userName !== getProfileResult.payload.userName) {
      await this.usersRepository.updateUserName(userId, inputModel.userName);
    }

    const updateProfileResult = await this.profileRepository.updateProfile(
      userId,
      inputModel,
    );
    if (updateProfileResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success);
    }
  }
}
