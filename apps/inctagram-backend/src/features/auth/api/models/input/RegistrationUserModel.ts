import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsUniqueLoginWithEmail } from '../../../../infrastructure/decorators/validators/uniqueLoginAndEmail.validator';

export class RegistrationUserModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 30)
  @IsUniqueLoginWithEmail()
  login: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsUniqueLoginWithEmail()
  email: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches('^[a-zA-Z0-9_-]*$')
  @Length(6, 20)
  password: string;
}
