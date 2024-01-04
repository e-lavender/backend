import { SortDirection } from '../../../../../../../libs/enums';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { isNil } from '@nestjs/common/utils/shared.utils';

export class DefaultPaginationInput {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : 'createdAt';
  })
  sortBy = 'createdAt';
  @IsOptional()
  @Transform(({ value }): SortDirection => {
    return value === SortDirection.asc ? SortDirection.asc : SortDirection.desc;
  })
  sortDirection: 'asc' | 'desc' = SortDirection.desc;
  @IsOptional()
  @Transform(({ value }): number => {
    return value < 1 || value % 1 !== 0 ? 1 : Number(value);
  })
  currentPage = 1;
  @IsOptional()
  @Transform(({ value }): number => {
    return value < 1 || value % 1 !== 0 ? 8 : Number(value);
  })
  pageSize = 8;

  skip(): number {
    return (this.currentPage - 1) * this.pageSize;
  }
  pagesCount(prismaCount: { _count: { userId: number } }): number {
    return Math.ceil(prismaCount._count.userId / this.pageSize);
  }
  itemsCount(prismaCount: { _count: { userId: number } }): number {
    return prismaCount._count.userId;
  }
}
