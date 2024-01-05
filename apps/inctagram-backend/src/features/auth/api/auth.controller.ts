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
import { GlobalConfigService } from '../../../../config/config.service';
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
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BAD_REQUEST_SCHEMA } from '../../../../../../libs/swagger/schemas/bad-request.schema';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions } from 'express-serve-static-core';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController extends ExceptionAndResponseHelper {
  constructor(
    private commandBus: CommandBus,
    private configService: GlobalConfigService,
    private usersQueryRepository: UsersQueryRepository,
  ) {
    super(ApproachType.http);
  }

  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address',
  })
  @ApiNoContentResponse({
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({
    summary: 'Confirm Registration',
    description:
      'This endpoint is used to confirm email ownership and automatically redirect the user to the login page.',
  })
  @ApiQuery({
    name: 'code',
    description: 'Code that be sent via Email inside link',
  })
  @ApiNoContentResponse({
    description: 'Email was verified. Account was activated',
  })
  @ApiBadRequestResponse({
    description:
      'If the confirmation code is incorrect, expired or already been applied',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @ApiQuery({
    name: 'code',
    description: 'Code that will be emailed inside the link',
  })
  @ApiNoContentResponse({
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description:
      'If the confirmation code is incorrect, expired or already been applied',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({
    summary:
      'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
  })
  @ApiNoContentResponse({
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has invalid email (for example 222^gmail.com)',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({
    summary: 'Confirm recovery password',
    description:
      'This endpoint is used to confirm email ownership and automatically redirect the user to input new password page.',
  })
  @ApiQuery({
    name: 'code',
    description: 'Recovery code that be sent via Email inside link',
  })
  @ApiNoContentResponse({
    description: 'Email was verified.',
  })
  @ApiBadRequestResponse({
    description:
      'If the recovery code is incorrect, expired or already been used',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({
    summary: 'New password',
    description: 'This endpoint is used to set a new password',
  })
  @ApiNoContentResponse({
    description: 'If code is valid and new password is accepted',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values(recovery code is incorrect, expired or not confirmed or password incorrect)',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({ summary: 'Try login user to the system' })
  @ApiOkResponse({
    description:
      'Returns JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 200 minutes).',
    schema: {
      type: 'string',
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiUnauthorizedResponse({ description: 'If the password or login is wrong' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers('user-agent') deviceName: string,
    @Headers('origin') origin: string,
    @Body() inputModel: LoginModel,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const loginResult = await this.commandBus.execute(
      new LoginCommand(inputModel.email, inputModel.password, deviceName, ip),
    );
    this.sendExceptionOrResponse(loginResult);

    const cookieOptions: CookieOptions = { secure: true };
    if (!origin?.search('localhost')) {
      cookieOptions.httpOnly = true;
    } else {
      cookieOptions.sameSite = 'none';
    }

    res.cookie('refreshToken', loginResult.payload.refreshToken, cookieOptions);

    return { accessToken: loginResult.payload.accessToken };
  }

  @ApiOperation({
    summary:
      'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)',
  })
  @ApiOkResponse({
    description:
      'Returns new pair: JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 200 minutes).',
    schema: {
      type: 'string',
      example: {
        accessToken: 'string',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'If the refreshToken has incorrect or expired',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshSession(
    @CurrentUserId() userId: number,
    @RefreshTokenPayload() refreshTokenPayload: RefreshToken,
    @Headers('origin') origin: string,
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

    const cookieOptions: CookieOptions = { secure: true };
    if (!origin?.search('localhost')) {
      cookieOptions.httpOnly = true;
    } else {
      cookieOptions.sameSite = 'none';
    }

    res.cookie(
      'refreshToken',
      refreshResult.payload.refreshToken,
      cookieOptions,
    );

    return { accessToken: refreshResult.payload.accessToken };
  }

  @ApiOperation({ summary: 'Get information about current user' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ViewUserModel })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Get('me')
  @UseGuards(JwtAccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUserId() userId: number): Promise<ViewUserModel> {
    const userResult = await this.usersQueryRepository.findUser(userId);

    return this.sendExceptionOrResponse(userResult);
  }

  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @ApiNoContentResponse({ description: 'No Content' })
  @ApiBadRequestResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    schema: BAD_REQUEST_SCHEMA,
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async logout(
    @CurrentUserId() userId: number,
    @RefreshTokenPayload() refreshTokenPayload: RefreshToken,
  ): Promise<void> {
    const logoutResult = await this.commandBus.execute(
      new LogoutCommand(
        userId,
        refreshTokenPayload.deviceId,
        refreshTokenPayload.iat,
      ),
    );

    return this.sendExceptionOrResponse(logoutResult);
  }
}
