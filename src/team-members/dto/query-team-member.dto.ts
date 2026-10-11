import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TeamMemberTier } from '../schemas/team-member.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryTeamMemberDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by membership tier',
    enum: TeamMemberTier,
  })
  @IsOptional()
  @IsEnum(TeamMemberTier)
  tier?: TeamMemberTier;

  @ApiPropertyOptional({ description: 'Search by member name or position' })
  @IsOptional()
  @IsString()
  search?: string;
}
