import { ApiProperty } from '@nestjs/swagger';

export class ViewProfileModel {
  @ApiProperty()
  login: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  dateOfBirth: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  aboutMe: string;
}
