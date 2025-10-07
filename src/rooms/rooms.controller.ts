import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
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

@ApiTags('rooms')
@Controller('rooms')
@UseInterceptors(ResourceLinksInterceptor)
@JsonApiType('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: CreateRoomDto,
  })
  @ResourceLinks([selfLink('rooms'), updateLink('rooms'), deleteLink('rooms')])
  @ResourceRelationships([
    relationship('assignments', 'room-assignments'),
    relationship('building', 'buildings'),
  ])
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms ' })
  @ApiResponse({ status: 200, description: 'Rooms fetched successfully' })
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
    selfLink('rooms'),
    {
      name: 'create',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/rooms`;
      },
      method: 'POST',
      title: 'Create Room',
    },
  ])
  async findAll(@Query() pagination: PaginationQueryDto) {
    return await this.roomsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 200, description: 'Room fetched successfully' })
  @ResourceLinks([
    selfLink('rooms'),
    updateLink('rooms'),
    deleteLink('rooms'),
    // Nested resource links
    nestedLink('assignments', 'assignments'),
    nestedLink('bookings', 'bookings'),
    // Related resource links
    relatedLink('building', 'buildings'),
    relatedLink('floor', 'floors'),
  ])
  @ResourceRelationships([
    relationship('assignments', 'room-assignments'),
    relationship('bookings', 'bookings'),
    relationship('building', 'buildings'),
    relationship('floor', 'floors'),
  ])
  async findOne(@Param('id') id: string) {
    return await this.roomsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ResourceLinks([selfLink('rooms'), updateLink('rooms'), deleteLink('rooms')])
  @ResourceRelationships([
    relationship('assignments', 'room-assignments'),
    relationship('building', 'buildings'),
  ])
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return await this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ResourceLinks([selfLink('rooms')])
  async remove(@Param('id') id: string) {
    return await this.roomsService.remove(id);
  }
}
