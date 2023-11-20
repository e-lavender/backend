import { IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class PasswordRecoveryModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}
