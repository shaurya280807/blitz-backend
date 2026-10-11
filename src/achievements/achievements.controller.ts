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
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { QueryAchievementDto } from './dto/query-achievement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({
    summary: 'List achievements with pagination, year filtering, and search (Public)',
  })
  async findAll(@Query() queryDto: QueryAchievementDto) {
    return this.achievementsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single achievement by UUID (Public)' })
  @ApiResponse({ status: 200, description: 'Achievement details' })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.achievementsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new achievement (Admin only)' })
  @ApiResponse({ status: 201, description: 'Achievement created' })
  async create(@Body() createDto: CreateAchievementDto) {
    return this.achievementsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing achievement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Achievement updated' })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateAchievementDto) {
    return this.achievementsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an achievement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Achievement deleted' })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.achievementsService.delete(id);
  }
}
