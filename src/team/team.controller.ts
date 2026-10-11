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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMemberTier } from './schemas/team-member.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: 'List all team members, optionally filtered by tier (Public)' })
  @ApiQuery({
    name: 'tier',
    enum: TeamMemberTier,
    required: false,
    description: 'Filter by membership tier',
  })
  async findAll(@Query('tier') tier?: TeamMemberTier) {
    return this.teamService.findAll(tier);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team member by UUID (Public)' })
  @ApiResponse({ status: 200, description: 'Team member details' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Team member created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createDto: CreateTeamMemberDto) {
    return this.teamService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a team member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Team member updated successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateTeamMemberDto) {
    return this.teamService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a team member and detach from projects (Admin only)' })
  @ApiResponse({ status: 200, description: 'Team member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamService.delete(id);
  }
}
