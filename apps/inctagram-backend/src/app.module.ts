import { configModule } from './config/config.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GlobalConfigService } from './config/config.service';
import { UniqueLoginAndEmailValidator } from './features/infrastructure/decorators/validators/uniqueLoginAndEmail.validator';
import { RegistrationUseCase } from './features/auth/application/use-cases/registration.use-case';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { AuthController } from './features/auth/api/auth.controller';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user.use-case';
import { EmailAdapter } from './features/email/adapter/email.adapter';
import { EmailManager } from './features/email/manager/email.manager';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user.use-case';
import { DoOperationUseCase } from './features/email/application/use-cases/do-operation-use-case';
import { IsValidConfirmCodePipe } from './features/infrastructure/pipes/validConfirmCode.pipe';
import { ConfirmEmailUseCase } from './features/users/application/use-cases/confirm-email.use-case';
import { ResendEmailConfirmationUseCase } from './features/auth/application/use-cases/resend-email-confirmation.use-case';
import { IsValidAndNotConfirmedCodePipe } from './features/infrastructure/pipes/validAndNotConfirmedCode.pipe';
import { PasswordRecoveryUseCase } from './features/users/application/use-cases/password-recovery.use-case';
import { ConfirmPasswordRecoveryUseCase } from './features/users/application/use-cases/confirm-password-recovery.use-case';
import { IsValidAndNotConfirmedRecoveryCodePipe } from './features/infrastructure/pipes/validAndNotRecoveryCode.pipe';
import { UpdatePasswordUseCase } from './features/users/application/use-cases/update-password.use-case';
import { ValidConfirmOrRecoveryCodeValidator } from './features/infrastructure/decorators/validators/validConfirmOrRecoveryCode.validator';
import { JwtModule } from '@nestjs/jwt';
import { LocalAuthStrategy } from './features/auth/strategies/local-auth.strategy';
import { ValidateUserUseCase } from './features/auth/application/use-cases/validate-user.use-case';
import { LoginUseCase } from './features/auth/application/use-cases/login.use-case';
import { CreateDeviceUseCase } from './features/devices/application/use-cases/create-device.use-case';
import { DevicesRepository } from './features/devices/infrastructure/devices.repository';
import { JwtAccessAuthStrategy } from './features/auth/strategies/jwt-access-auth.strategy';
import { UsersQueryRepository } from './features/users/infrastructure/users-query.repository';
import { JwtRefreshAuthStrategy } from './features/auth/strategies/jwt-refresh-auth.strategy';
import { RefreshSessionUseCase } from './features/auth/application/use-cases/refresh-session.use-case';
import { UpdateSessionUseCase } from './features/devices/application/use-cases/update-session.use-case';
import { LogoutUseCase } from './features/auth/application/use-cases/logout.use-case';
import { DeleteDeviceUseCase } from './features/devices/application/use-cases/delete-device.use-case';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';

const services = [GlobalConfigService, PrismaService];

const validators = [UniqueLoginAndEmailValidator];

const useCases = [
  RegistrationUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  DoOperationUseCase,
  ConfirmEmailUseCase,
  ResendEmailConfirmationUseCase,
  PasswordRecoveryUseCase,
  ConfirmPasswordRecoveryUseCase,
  UpdatePasswordUseCase,
  ValidateUserUseCase,
  LoginUseCase,
  CreateDeviceUseCase,
  RefreshSessionUseCase,
  UpdateSessionUseCase,
  LogoutUseCase,
  DeleteDeviceUseCase,
];

const pipes = [
  IsValidConfirmCodePipe,
  IsValidAndNotConfirmedCodePipe,
  IsValidAndNotConfirmedRecoveryCodePipe,
];

const repositories = [UsersRepository, DevicesRepository, UsersQueryRepository];

@Module({
  imports: [
    CqrsModule,
    configModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot:
        process.env.NODE_ENV === 'development' ? '/' : '/api/v1/swagger',
    }),
    ThrottlerModule.forRoot([{ ttl: 1000, limit: 10 }]),
  ],
  controllers: [AuthController],
  providers: [
    ...services,
    ...validators,
    ...useCases,
    ...repositories,
    EmailAdapter,
    EmailManager,
    ...pipes,
    ValidConfirmOrRecoveryCodeValidator,
    LocalAuthStrategy,
    JwtAccessAuthStrategy,
    JwtRefreshAuthStrategy,
  ],
})
export class AppModule {}
