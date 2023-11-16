import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginModel {
  @IsString()
  @Transform(({ value }) => value.trim())
  email: string;
  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}
