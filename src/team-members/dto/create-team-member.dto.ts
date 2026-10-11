import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamMemberTier } from '../schemas/team-member.schema';

export class CreateTeamMemberDto {
  @ApiProperty({ description: 'Member full name', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Role or society position', example: 'President' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    description: 'Membership tier',
    enum: TeamMemberTier,
    example: TeamMemberTier.CORE,
  })
  @IsEnum(TeamMemberTier, {
    message: 'tier must be one of: core, senior, junior, volunteer',
  })
  tier: TeamMemberTier;

  @ApiPropertyOptional({ description: 'Profile image path or URL', example: '/uploads/abc.webp' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Short biography',
    example: 'CS student passionate about open source',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/janedoe',
  })
  @IsOptional()
  @ValidateIf((o) => o.linkedin !== '' && o.linkedin !== undefined)
  @IsUrl({}, { message: 'linkedin must be a valid URL' })
  linkedin?: string;

  @ApiPropertyOptional({ description: 'GitHub profile URL', example: 'https://github.com/janedoe' })
  @IsOptional()
  @ValidateIf((o) => o.github !== '' && o.github !== undefined)
  @IsUrl({}, { message: 'github must be a valid URL' })
  github?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/janedoe',
  })
  @IsOptional()
  @ValidateIf((o) => o.instagram !== '' && o.instagram !== undefined)
  @IsUrl({}, { message: 'instagram must be a valid URL' })
  instagram?: string;
}
