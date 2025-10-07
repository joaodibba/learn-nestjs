import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RoomAssignmentsService } from './room-assignments.service';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';
import { PaginationQueryDto } from '../dto/pagination.dto';

@ApiTags('room-assignments')
@Controller('room-assignments')
export class RoomAssignmentsController {
  constructor(private readonly roomAssignmentsService: RoomAssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room assignment' })
  @ApiResponse({ status: 201, description: 'Room assignment created successfully' })
  async create(@Body() createRoomAssignmentDto: CreateRoomAssignmentDto) {
    return await this.roomAssignmentsService.create(createRoomAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all room assignments ' })
  @ApiResponse({ status: 200, description: 'Room assignments fetched successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return await this.roomAssignmentsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room assignments by employee ID' })
  @ApiResponse({ status: 200, description: 'Room assignments fetched successfully' })
  async findOne(@Param('id') id: string) {
    return await this.roomAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room assignment' })
  @ApiResponse({ status: 200, description: 'Room assignment updated successfully' })
  async update(@Param('id') id: string, @Body() updateRoomAssignmentDto: UpdateRoomAssignmentDto) {
    return await this.roomAssignmentsService.update(id, updateRoomAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room assignment' })
  @ApiResponse({ status: 200, description: 'Room assignment deleted successfully' })
  async remove(@Param('id') id: string) {
    return await this.roomAssignmentsService.remove(id);
  }
}
