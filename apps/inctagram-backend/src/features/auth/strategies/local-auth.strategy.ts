import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidateUserCommand } from '../application/use-cases/validate-user.use-case';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<boolean> {
    const validateResult = await this.commandBus.execute(
      new ValidateUserCommand(email, password),
    );
    if (validateResult.hasError()) throw new UnauthorizedException();

    return true;
  }
}
