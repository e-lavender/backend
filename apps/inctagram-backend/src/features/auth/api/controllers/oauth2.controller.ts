import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExceptionAndResponseHelper } from '../../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../../libs/enums';
import { CommandBus } from '@nestjs/cqrs';
import { GlobalConfigService } from '../../../../../config/config.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('OAuth2')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class Oauth2Controller extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private configService: GlobalConfigService,
  ) {
    super(ApproachType.http);
  }

  @Get('google')
  async registerByGoogle() {}

  @Get('github')
  async registerByGithub() {}
}
