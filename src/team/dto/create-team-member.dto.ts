import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamMemberTier } from '../schemas/team-member.schema';

export class CreateTeamMemberDto {
  @ApiProperty({ description: 'Full name of the team member', example: 'Aarav Sharma' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Position or designation', example: 'Technical Lead' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({
    description: 'Membership tier',
    enum: TeamMemberTier,
    example: TeamMemberTier.CORE,
  })
  @IsEnum(TeamMemberTier)
  @IsNotEmpty()
  tier: TeamMemberTier;

  @ApiPropertyOptional({
    description: 'Image URL or relative path from image upload',
    example: '/uploads/e69fc68b-59d4-42b7-bd62-10e309cb6b69.webp',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Short biography',
    example: 'Full-stack developer passionate about open source.',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/aaravsharma',
  })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'GitHub profile URL',
    example: 'https://github.com/aaravsharma',
  })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/aaravsharma',
  })
  @IsString()
  @IsOptional()
  instagram?: string;
}
