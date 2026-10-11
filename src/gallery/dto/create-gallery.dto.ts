import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGalleryDto {
  @ApiProperty({
    description: 'Image URL or path',
    example: '/uploads/c12d34ef-56ab-7890-cdef-123456789012.webp',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({
    description: 'Title or caption for the photo',
    example: 'Annual Hackathon 2026 Opening Ceremony',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
