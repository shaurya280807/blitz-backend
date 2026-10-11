import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Event title', example: 'CodeBlitz 2026 Hackathon' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed event description',
    example: 'Annual 24-hour national hackathon',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Event date and time (ISO 8601 string, e.g., 2026-11-15T10:00:00.000Z)',
    example: '2026-11-15T10:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'date must be a valid ISO 8601 date string' })
  date: Date;

  @ApiProperty({
    description: 'Event venue or location',
    example: 'Auditorium, Keshav Mahavidyalaya',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    description: 'Any additional notes or instructions for attendees',
    example: 'Bring your laptop, student ID card, and charger.',
  })
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
