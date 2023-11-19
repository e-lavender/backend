import { ApiProperty } from '@nestjs/swagger';

export class ViewUserModel {
  @ApiProperty()
  login: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  userId: number;
}
