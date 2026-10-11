import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryGalleryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search gallery items by title' })
  @IsOptional()
  @IsString()
  search?: string;
}
