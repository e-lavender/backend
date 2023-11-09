import { configModule } from './config/config.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CqrsModule } from '@nestjs/cqrs';
import { GlobalConfigService } from './config/config.service';
import { UniqueLoginAndEmailValidator } from './features/infrastructure/decorators/validators/uniqueLoginAndEmail.validator';
import { RegistrationUseCase } from './features/auth/application/use-cases/registration-use-case';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { AuthController } from './features/auth/api/auth.controller';
import { CreateUserUseCase } from './features/users/application/use-cases/create-user.use-case';
import { EmailAdapter } from './features/email/adapter/email.adapter';
import { EmailManager } from './features/email/manager/email.manager';
import { DeleteUserUseCase } from './features/users/application/use-cases/delete-user.use-case';
import { DoOperationUseCase } from './features/email/application/use-cases/do-operation-use-case';

const services = [GlobalConfigService, AppService, PrismaService];

const validators = [UniqueLoginAndEmailValidator];

const useCases = [
  RegistrationUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  DoOperationUseCase,
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
  ],
})
export class AppModule {}
