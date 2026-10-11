import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryAchievementDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by achievement year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: 'Search achievement title, event, team, or result' })
  @IsOptional()
  @IsString()
  search?: string;
}
