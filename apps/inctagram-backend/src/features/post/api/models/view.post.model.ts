import { ApiProperty } from '@nestjs/swagger';

export class ViewPostModel {
  @ApiProperty()
  description: string;
  @ApiProperty()
  createdAt: string;
}
