import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadPhotosModel {
  @ApiPropertyOptional({
    minimum: 0,
    maximum: 500,
    description: "Post's description",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @Length(0, 500)
  description: string;
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description:
      'Array of uploaded images (PNG or JPEG format, maximum 10 images allowed, maximum size: 20MB each)',
  })
  images: any[];
}
