import { ExceptionAndResponseHelper } from '../../../../../../libs/core/exceptionAndResponse';
import { ApproachType, InternalCode } from '../../../../../../libs/enums';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { RegistrationUserModel } from './models/input/RegistrationUserModel';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from '../application/use-cases/registration.use-case';
import { ConfirmEmailCommand } from '../../users/application/use-cases/confirm-email.use-case';
import { Response } from 'express';
import { GlobalConfigService } from '../../../config/config.service';
import { ResendEmailConfirmationCommand } from '../application/use-cases/resend-email-confirmation.use-case';
import { IsValidConfirmCodePipe } from '../../infrastructure/pipes/validConfirmCode.pipe';
import { IsValidAndNotConfirmedCodePipe } from '../../infrastructure/pipes/validAndNotConfirmedCode.pipe';
import { PasswordRecoveryModel } from './models/input/PasswordRecoveryModel';
import { PasswordRecoveryCommand } from '../../users/application/use-cases/password-recovery.use-case';
import { ConfirmPasswordRecoveryCommand } from '../../users/application/use-cases/confirm-password-recovery.use-case';
import { IsValidAndNotConfirmedRecoveryCodePipe } from '../../infrastructure/pipes/validAndNotRecoveryCode.pipe';
import { UpdatePasswordModel } from './models/input/UpdatePasswordModel';
import { UpdatePasswordCommand } from '../../users/application/use-cases/update-password.use-case';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginModel } from './models/input/LoginModel';
import { LoginCommand } from '../application/use-cases/login.use-case';
import { JwtAccessAuthGuard } from '../guards/jwt-access-auth.guard';
import { CurrentUserId } from '../../infrastructure/decorators/params/current-user-id.decorator';
import { ViewUserModel } from '../../users/api/models/output/ViewUserModel';
import { UsersQueryRepository } from '../../users/infrastructure/users-query.repository';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { RefreshTokenPayload } from '../../infrastructure/decorators/params/refresh-token.decorator';
import { RefreshToken } from '../../../../../../libs/types';
import { RefreshSessionCommand } from '../application/use-cases/refresh-session.use-case';

@Controller('auth')
export class AuthController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private configService: GlobalConfigService,
    private usersQueryRepository: UsersQueryRepository,
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

    if (
      confirmResult.code !== InternalCode.Expired &&
      confirmResult.code !== InternalCode.Success
    ) {
      return this.sendExceptionOrResponse(confirmResult);
    }

    const frontDomain = this.configService.getFrontDomain();

    const status = confirmResult.hasError() ? 'failed' : 'success';
    const redirectUrl = new URL(
      `${frontDomain}/auth/registration-confirmation/${status}`,
    );

    return res.redirect(redirectUrl.toString());
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() inputModel: PasswordRecoveryModel,
  ): Promise<void> {
    const passwordRecoveryResult = await this.commandBus.execute(
      new PasswordRecoveryCommand(inputModel.email),
    );

    return this.sendExceptionOrResponse(passwordRecoveryResult);
  }

  @Get('confirm-password-recovery')
  async confirmPasswordRecovery(
    @Query('code', IsValidAndNotConfirmedRecoveryCodePipe) code: string,
    @Res() res: Response,
  ): Promise<void> {
    const confirmPasswordRecoveryResult = await this.commandBus.execute(
      new ConfirmPasswordRecoveryCommand(code),
    );

    if (
      confirmPasswordRecoveryResult.code !== InternalCode.Expired &&
      confirmPasswordRecoveryResult.code !== InternalCode.Success
    ) {
      return this.sendExceptionOrResponse(confirmPasswordRecoveryResult);
    }

    const frontDomain = this.configService.getFrontDomain();

    const status = confirmPasswordRecoveryResult.hasError()
      ? 'failed'
      : 'success';

    const redirectUrl = new URL(
      `${frontDomain}/auth/create-new-password/${status}?code=${confirmPasswordRecoveryResult.payload.code}`,
    );

    return res.redirect(redirectUrl.toString());
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRecoveryPassword(
    @Body() inputModel: UpdatePasswordModel,
  ): Promise<void> {
    const updatePasswordResult = await this.commandBus.execute(
      new UpdatePasswordCommand(
        inputModel.recoveryCode,
        inputModel.newPassword,
      ),
    );

    return this.sendExceptionOrResponse(updatePasswordResult);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers('user-agent') deviceName: string,
    @Body() inputModel: LoginModel,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const loginResult = await this.commandBus.execute(
      new LoginCommand(inputModel.email, inputModel.password, deviceName, ip),
    );
    this.sendExceptionOrResponse(loginResult);

    res.cookie(
      'refreshToken',
      loginResult.payload.refreshToken /*, {
      httpOnly: true,
      secure: true,
    }*/,
    );

    return { accessToken: loginResult.payload.accessToken };
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshSession(
    @CurrentUserId() userId: number,
    @RefreshTokenPayload() refreshTokenPayload: RefreshToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshResult = await this.commandBus.execute(
      new RefreshSessionCommand(
        userId,
        refreshTokenPayload.deviceId,
        refreshTokenPayload.iat,
      ),
    );
    this.sendExceptionOrResponse(refreshResult);

    res.cookie('refreshToken', refreshResult.payload.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: refreshResult.payload.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUserId() userId: number): Promise<ViewUserModel> {
    const userResult = await this.usersQueryRepository.findUser(userId);

    return this.sendExceptionOrResponse(userResult);
  }
}
