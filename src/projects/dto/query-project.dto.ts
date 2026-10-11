import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryProjectDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Tag UUID' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Search in project name or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
