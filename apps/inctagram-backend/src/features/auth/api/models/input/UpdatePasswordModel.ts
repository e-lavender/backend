import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidCode } from '../../../../infrastructure/decorators/validators/validConfirmOrRecoveryCode.validator';

export class UpdatePasswordModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  newPassword: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsValidCode()
  recoveryCode: string;
}
