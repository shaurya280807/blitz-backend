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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '../common/pipes/parse-uuid.pipe';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events with pagination, date filtering, and search (Public)' })
  async findAll(@Query() queryDto: QueryEventDto) {
    return this.eventsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by UUID (Public)' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Invalid date or parameters' })
  async create(@Body() createDto: CreateEventDto) {
    return this.eventsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateEventDto) {
    return this.eventsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event deleted' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.delete(id);
  }
}
