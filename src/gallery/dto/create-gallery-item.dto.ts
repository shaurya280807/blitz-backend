import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGalleryItemDto {
  @ApiProperty({ description: 'Gallery photo title/caption', example: 'Orientation Day 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Image path or URL', example: '/uploads/gallery-1.webp' })
  @IsString()
  @IsNotEmpty()
  image: string;
}
