import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { ApproachType } from '../../../../../../libs/enums';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationUserModel } from './models/input/RegistrationUserModel';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from '../application/use-cases/registration-use-case';

@Controller('auth')
export class AuthController extends ExceptionAndResponseHelper {
  constructor(private commandBus: CommandBus) {
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
}
