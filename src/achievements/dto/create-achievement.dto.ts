import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievementDto {
  @ApiProperty({ description: 'Year of the achievement', example: 2025 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ description: 'Title or recognition won', example: '1st Place in HackDelhi 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Team name or member names (free text)',
    example: 'Shaurya Gupta, Ananya Sharma',
  })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({ description: 'Name of the event or competition', example: 'HackDelhi 2025' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'Result or award attained', example: 'Winner (Cash Prize ₹50,000)' })
  @IsString()
  @IsNotEmpty()
  result: string;

  @ApiPropertyOptional({
    description: 'Certificate or showcase image URL',
    example: '/uploads/cert.webp',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
