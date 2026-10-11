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
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { QueryTeamMemberDto } from './dto/query-team-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('team-members')
@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Get()
  @ApiOperation({ summary: 'List team members with pagination and tier filtering (Public)' })
  async findAll(@Query() queryDto: QueryTeamMemberDto) {
    return this.teamMembersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single team member by UUID (Public)' })
  @ApiResponse({ status: 200, description: 'Team member details' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMembersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Team member created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createDto: CreateTeamMemberDto) {
    return this.teamMembersService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing team member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Team member updated' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateTeamMemberDto) {
    return this.teamMembersService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a team member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Team member deleted' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamMembersService.delete(id);
  }
}
