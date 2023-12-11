import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileModel } from '../../api/models/update.profile.model';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { ResultDTO } from '../../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../../libs/enums';

export class UpdateProfileCommand {
  constructor(public userId: number, public inputModel: UpdateProfileModel) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(private profileRepository: ProfileRepository) {}

  async execute(command: UpdateProfileCommand): Promise<ResultDTO<null>> {
    const profileResult = await this.profileRepository.updateProfile(
      command.userId,
      command.inputModel,
    );
    if (profileResult.hasError()) {
      return new ResultDTO(InternalCode.Internal_Server);
    } else {
      return new ResultDTO(InternalCode.Success);
    }
  }
}
