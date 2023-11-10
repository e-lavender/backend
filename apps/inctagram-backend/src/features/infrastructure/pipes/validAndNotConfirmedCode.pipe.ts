import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { isAfter } from 'date-fns';

@Injectable()
export class IsValidAndNotConfirmedCodePipe implements PipeTransform {
  constructor(private usersRepository: UsersRepository) {}

  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      const confirmDataResult = await this.usersRepository.findConfirmData(
        value,
      );
      if (confirmDataResult.hasError()) throw new BadRequestException();

      if (
        confirmDataResult.payload?.isConfirmed ||
        isAfter(new Date(), confirmDataResult.payload.expirationDate)
      )
        throw new BadRequestException();

      return value;
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
