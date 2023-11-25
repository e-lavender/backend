import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { isAfter } from 'date-fns';

@ValidatorConstraint({ async: true })
@Injectable()
export class ValidConfirmOrRecoveryCodeValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(code: string): Promise<boolean> {
    try {
      const confirmCodeResult = await this.usersRepository.findConfirmData(
        code,
      );
      const recoveryCodeResult = await this.usersRepository.findRecoveryData(
        code,
      );

      if (
        (confirmCodeResult.hasError() ||
          confirmCodeResult.payload?.isConfirmed) &&
        (recoveryCodeResult.hasError() ||
          isAfter(new Date(), recoveryCodeResult.payload.expirationDate))
      )
        return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Confirmation or Recovery code should be exist and actually';
  }
}

export function IsValidCode(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsValidConfirmationCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidConfirmOrRecoveryCodeValidator,
    });
  };
}
