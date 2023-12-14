import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileModel {
  @ApiProperty({
    minimum: 6,
    maximum: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(6, 20)
  login: string;
  @ApiProperty({
    minimum: 1,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 50)
  firstName: string;
  @ApiProperty({
    minimum: 1,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 50)
  lastName: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  dateOfBirth: string;
  @ApiProperty({
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(1, 50)
  city: string;
  @ApiProperty({
    minimum: 0,
    maximum: 200,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 200)
  aboutMe: string;
}
