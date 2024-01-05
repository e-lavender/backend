import { ApiProperty } from '@nestjs/swagger';

export class ViewProfileModel {
  @ApiProperty()
  userName: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  dateOfBirth: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  aboutMe: string;
  @ApiProperty()
  avatarUrl?: string;
}
