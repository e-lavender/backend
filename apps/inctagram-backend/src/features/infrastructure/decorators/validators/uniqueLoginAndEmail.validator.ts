import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/infrastructure/users-query.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class UniqueLoginAndEmailValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async validate(cred: string): Promise<boolean> {
    try {
      const userResult = await this.usersQueryRepository.findByCredentials(
        cred,
      );

      return userResult.hasError();
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const property = args.property[0].toUpperCase() + args.property.slice(1);
    return `${property} already exist`;
  }
}

export function IsUniqueLoginWithEmail(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueLoginWithEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueLoginAndEmailValidator,
    });
  };
}
