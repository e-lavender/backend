import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class IsValidConfirmCodePipe implements PipeTransform {
  constructor(private usersRepository: UsersRepository) {}

  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      const confirmDataResult = await this.usersRepository.findConfirmData(
        value,
      );
      console.log(confirmDataResult);
      if (
        confirmDataResult.hasError() ||
        confirmDataResult.payload?.isConfirmed
      )
        throw new BadRequestException();

      return value;
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
