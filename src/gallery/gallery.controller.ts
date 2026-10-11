import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { QueryGalleryDto } from './dto/query-gallery.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'List gallery entries with pagination and search (Public)' })
  async findAll(@Query() queryDto: QueryGalleryDto) {
    return this.galleryService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single gallery entry by UUID (Public)' })
  @ApiResponse({ status: 200, description: 'Gallery entry details' })
  @ApiResponse({ status: 404, description: 'Gallery entry not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new gallery photo (Admin only)' })
  @ApiResponse({ status: 201, description: 'Gallery entry created' })
  async create(@Body() createDto: CreateGalleryItemDto) {
    return this.galleryService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update title or image of a gallery item (Admin only)' })
  @ApiResponse({ status: 200, description: 'Gallery entry updated' })
  @ApiResponse({ status: 404, description: 'Gallery entry not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateGalleryItemDto) {
    return this.galleryService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery photo (Admin only)' })
  @ApiResponse({ status: 200, description: 'Gallery entry deleted' })
  @ApiResponse({ status: 404, description: 'Gallery entry not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.delete(id);
  }
}
