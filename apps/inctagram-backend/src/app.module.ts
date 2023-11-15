import { configModule } from './config/config.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

const services = [GlobalConfigService, AppService, PrismaService];

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
];

const repositories = [UsersRepository];

@Module({
  imports: [CqrsModule, configModule],
  controllers: [AppController, AuthController],
  providers: [
    ...services,
    ...validators,
    ...useCases,
    ...repositories,
    EmailAdapter,
    EmailManager,
    IsValidConfirmCodePipe,
    IsValidAndNotConfirmedCodePipe,
    IsValidAndNotConfirmedRecoveryCodePipe,
    ValidConfirmOrRecoveryCodeValidator,
  ],
})
export class AppModule {}
