import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginModel {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  email: string;
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}
