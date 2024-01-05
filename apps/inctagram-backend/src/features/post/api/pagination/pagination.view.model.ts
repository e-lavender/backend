import { ApiProperty } from '@nestjs/swagger';

export class PaginationViewModel<T> {
  @ApiProperty()
  pagesCount: number;
  @ApiProperty()
  currentPage: number;
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  itemsCount: number;
  @ApiProperty()
  items: T[];
}
