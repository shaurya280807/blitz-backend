import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name', example: 'BLITZ Portal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Society portal for departmental activities and showcases.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Project preview image URL or path',
    example: '/uploads/a12b34cd-56ef-7890-abcd-ef1234567890.webp',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'GitHub repository URL',
    example: 'https://github.com/blitz-kmv/blitz-portal',
  })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({
    description: 'Live deployment URL',
    example: 'https://blitz-kmv.github.io',
  })
  @IsString()
  @IsOptional()
  liveDemo?: string;

  @ApiPropertyOptional({
    description: 'Array of valid Team Member UUIDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  team?: string[];

  @ApiPropertyOptional({
    description: 'Array of valid Tag UUIDs',
    example: ['987fcdeb-51a2-43d7-9012-345678901234'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tags?: string[];
}
