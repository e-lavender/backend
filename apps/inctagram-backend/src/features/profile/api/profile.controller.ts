import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

  @ApiOperation({
    summary: 'Get my profile',
    description: 'This endpoint is used to getting my profile.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ViewProfileModel })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyProfile(
    @CurrentUserId() userId: number,
  ): Promise<ViewProfileModel> {
    const getProfileResult = await this.profileQueryRepository.getProfile(
      userId,
    );

    return this.sendExceptionOrResponse(getProfileResult);
  }

  @ApiOperation({
    summary: 'Update my profile',
    description: 'This endpoint is used to updating my profile.',
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'Input data is accepted. Profile have updated',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateProfile(
    @CurrentUserId() userId: number,
    @Body() inputModel: UpdateProfileModel,
  ) {
    const updateProfileResult = await this.commandBus.execute(
      new UpdateProfileCommand(userId, inputModel),
    );

    return this.sendExceptionOrResponse(updateProfileResult);
  }
}
