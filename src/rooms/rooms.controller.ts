import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UuidParamDto } from 'src/common/dto/uuid.dto';
import { FilterQuery } from 'src/common/decorators/api-filter.decorator';
import { filter } from 'rxjs';
import { RoomFilterDto } from './dto/room-filter.dto';

@ApiTags('rooms')
@Controller('rooms')
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
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({
    status: 200,
    description: 'Rooms fetched successfully',
    type: [CreateRoomDto],
  })
  async findAll(@FilterQuery() filters: RoomFilterDto) {
    return await this.roomsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({
    status: 200,
    description: 'Room fetched successfully',
    type: CreateRoomDto,
  })
  async findOne(@Param() params: UuidParamDto) {
    return await this.roomsService.findOne(params.id);
  }

  @Patch(':id')
  async update(
    @Param() params: UuidParamDto,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return await this.roomsService.update(params.id, updateRoomDto);
  }

  @Delete(':id')
  async remove(@Param() params: UuidParamDto) {
    return await this.roomsService.remove(params.id);
  }
}
