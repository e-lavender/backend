import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../libs/enums';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { RegistrationUserModel } from './models/input/RegistrationUserModel';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from '../application/use-cases/registration-use-case';
import { ConfirmEmailCommand } from '../../users/application/use-cases/confirm-email.use-case';
import { Response } from 'express';
import { GlobalConfigService } from '../../../config/config.service';
import { ResendEmailConfirmationCommand } from '../application/use-cases/resend-email-confirmation.use-case';
import { IsValidConfirmCodePipe } from '../../infrastructure/pipes/validConfirmCode.pipe';
import { IsValidAndNotConfirmedCodePipe } from '../../infrastructure/pipes/validAndNotConfirmedCode.pipe';

@Controller('auth')
export class AuthController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private configService: GlobalConfigService,
  ) {
    super(ApproachType.http);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: RegistrationUserModel): Promise<void> {
    const registrationResult = await this.commandBus.execute(
      new RegistrationCommand(
        inputModel.login,
        inputModel.email,
        inputModel.password,
      ),
    );

    return this.sendExceptionOrResponse(registrationResult);
  }

  @Post('resend-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendCode(
    @Query('code', IsValidConfirmCodePipe) code: string,
  ): Promise<void> {
    const sendingResult = await this.commandBus.execute(
      new ResendEmailConfirmationCommand(code),
    );

    return this.sendExceptionOrResponse(sendingResult);
  }

  @Get('registration-confirmation')
  async confirmRegistration(
    @Query('code', IsValidAndNotConfirmedCodePipe) code: string,
    @Res() res: Response,
  ): Promise<void> {
    const confirmResult = await this.commandBus.execute(
      new ConfirmEmailCommand(code),
    );
    if (confirmResult.hasError()) {
      return this.sendExceptionOrResponse(confirmResult);
    }
    const frontDomain = this.configService.getFrontDomain();

    const redirectUrl = new URL(`${frontDomain}/auth/sign-in`);

    return res.redirect(redirectUrl.toString());
  }
}
