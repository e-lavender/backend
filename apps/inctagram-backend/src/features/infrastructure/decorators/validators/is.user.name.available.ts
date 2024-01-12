import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersQueryRepository } from '../../../users/infrastructure/users-query.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUserNameAvailableValidator
  implements ValidatorConstraintInterface
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async validate(userName: string): Promise<boolean> {
    try {
      // todo - как передать сюда id текущего пользователя, чтобы исключить его из поиска по userName?
      const id = 41;
      const userResult = await this.usersQueryRepository.findByUserName(
        id,
        userName,
      );
      return userResult.hasError();
    } catch (e) {
      // console.log(e);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const property = args.property[0].toUpperCase() + args.property.slice(1);
    return `${property} already exist, choose another user name`;
  }
}

export function IsUserNameAvailable(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsUserNameAvailable',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserNameAvailableValidator,
    });
  };
}
