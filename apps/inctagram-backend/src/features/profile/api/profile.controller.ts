import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { CommandBus } from '@nestjs/cqrs';
import { ApproachType } from '../../../../../../libs/enums';
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';
import { ProfileQueryRepository } from '../infrastructure/profile.query.repository';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.decorator';
import { UpdateProfileModel } from './models/update.profile.model';
import { UpdateProfileCommand } from '../application/use.cases/update.profile.use.case';
import { ViewProfileModel } from './models/view.profile.model';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(ThrottlerGuard, JwtAccessAuthGuard)
export class ProfileController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private profileQueryRepository: ProfileQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyProfile(
    @CurrentUserId() userId: number,
  ): Promise<ViewProfileModel> {
    const profileResult = await this.profileQueryRepository.getProfile(userId);

    return this.sendExceptionOrResponse(profileResult);
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateProfile(
    @CurrentUserId() userId: number,
    @Body() inputModel: UpdateProfileModel,
  ) {
    const updatingResult = await this.commandBus.execute(
      new UpdateProfileCommand(userId, inputModel),
    );

    return this.sendExceptionOrResponse(updatingResult);
  }

  // todo - непонятно, в какой момент создается сущность Profile
  // при подтверждении пользователя?
}
