import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDescriptionModel {
  @ApiProperty({
    minimum: 0,
    maximum: 500,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 500)
  description: string;
  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // @Transform(({ value }) => value.trim())
  // photoUrl: string;
}
