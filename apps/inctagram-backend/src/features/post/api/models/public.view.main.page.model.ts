import { ApiProperty } from '@nestjs/swagger';
import { ViewPostModel } from './view.post.model';

export class PublicViewMainPageModel {
  @ApiProperty()
  usersCount: number;
  @ApiProperty()
  lastPosts: ViewPostModel;
}
