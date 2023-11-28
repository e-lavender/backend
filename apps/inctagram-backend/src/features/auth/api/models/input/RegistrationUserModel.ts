import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsUniqueLoginWithEmail } from '../../../../infrastructure/decorators/validators/uniqueLoginAndEmail.validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationUserModel {
  @ApiProperty({
    minimum: 6,
    maximum: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 30)
  @IsUniqueLoginWithEmail()
  login: string;
  @ApiProperty({ pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$\n' })
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  @IsUniqueLoginWithEmail()
  email: string;
  @ApiProperty({
    minimum: 6,
    maximum: 20,
    pattern:
      '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~]).*$/',
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(
    '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~]).*$/',
  )
  @Length(6, 20)
  password: string;
}
