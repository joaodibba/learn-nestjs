import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RoomAssignmentsService } from './room-assignments.service';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';
import { PaginationQueryDto } from '../services/dto/pagination.dto';
import { ResourceLinksInterceptor } from '../interceptors/resource-links.interceptor';
import {
  ResourceLinks,
  ResourceRelationships,
  selfLink,
  updateLink,
  deleteLink,
  nestedLink,
  relatedLink,
  relationship,
} from '../decorators/resource-links.decorator';
import { JsonApiType } from '../decorators/jsonapi.decorator';

@ApiTags('room-assignments')
@Controller('room-assignments')
@UseInterceptors(ResourceLinksInterceptor)
@JsonApiType('room-assignments')
export class RoomAssignmentsController {
  constructor(
    private readonly roomAssignmentsService: RoomAssignmentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room assignment' })
  @ApiResponse({
    status: 201,
    description: 'Room assignment created successfully',
  })
  @ResourceLinks([
    selfLink('room-assignments'),
    updateLink('room-assignments'),
    deleteLink('room-assignments'),
  ])
  @ResourceRelationships([
    relationship('employee', 'employees'),
    relationship('room', 'rooms'),
  ])
  async create(@Body() createRoomAssignmentDto: CreateRoomAssignmentDto) {
    return await this.roomAssignmentsService.create(createRoomAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all room assignments ' })
  @ApiResponse({
    status: 200,
    description: 'Room assignments fetched successfully',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ResourceLinks([
    selfLink('room-assignments'),
    {
      name: 'create',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/room-assignments`;
      },
      method: 'POST',
      title: 'Create Room Assignment',
    },
  ])
  async findAll(@Query() pagination: PaginationQueryDto) {
    return await this.roomAssignmentsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room assignments by employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Room assignments fetched successfully',
  })
  @ResourceLinks([
    selfLink('room-assignments'),
    updateLink('room-assignments'),
    deleteLink('room-assignments'),
    // Conditional link - only show if assignment is active
    {
      name: 'end-assignment',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/room-assignments/${resource.id}/end`;
      },
      method: 'POST',
      title: 'End Assignment',
      condition: (resource) => !resource.endDate,
    },
  ])
  @ResourceRelationships([
    relationship('employee', 'employees'),
    relationship('room', 'rooms'),
  ])
  async findOne(@Param('id') id: string) {
    return await this.roomAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room assignment' })
  @ApiResponse({
    status: 200,
    description: 'Room assignment updated successfully',
  })
  @ResourceLinks([
    selfLink('room-assignments'),
    updateLink('room-assignments'),
    deleteLink('room-assignments'),
  ])
  @ResourceRelationships([
    relationship('employee', 'employees'),
    relationship('room', 'rooms'),
  ])
  async update(
    @Param('id') id: string,
    @Body() updateRoomAssignmentDto: UpdateRoomAssignmentDto,
  ) {
    return await this.roomAssignmentsService.update(
      id,
      updateRoomAssignmentDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room assignment' })
  @ApiResponse({
    status: 200,
    description: 'Room assignment deleted successfully',
  })
  @ResourceLinks([selfLink('room-assignments')])
  async remove(@Param('id') id: string) {
    return await this.roomAssignmentsService.remove(id);
  }
}
