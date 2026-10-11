import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryEventDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search event title, description, or location' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter only upcoming events (true) or past events (false)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  upcoming?: boolean;
}
