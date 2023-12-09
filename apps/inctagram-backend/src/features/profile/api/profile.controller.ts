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
import { GlobalConfigService } from '../../../config/config.service';
import { ApproachType } from '../../../../../../libs/enums';
import { JwtAccessAuthGuard } from '../../auth/guards/jwt-access-auth.guard';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(ThrottlerGuard, JwtAccessAuthGuard)
export class ProfileController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private configService: GlobalConfigService,
  ) {
    super(ApproachType.http);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyProfile() {}

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMyProfile(@Body() inputModel: UpdateProfileModel) {}
}
