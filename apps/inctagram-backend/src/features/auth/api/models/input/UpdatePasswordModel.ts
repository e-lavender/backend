import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsValidCode } from '../../../../infrastructure/decorators/validators/validConfirmOrRecoveryCode.validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordModel {
  @ApiProperty({ minimum: 6, maximum: 20, pattern: '^[a-zA-Z0-9_-]*$' })
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 20)
  @Matches('^[a-zA-Z0-9_-]*$')
  newPassword: string;
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsValidCode()
  recoveryCode: string;
}
