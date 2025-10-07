import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly logger: Logger,
  ) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    this.logger.log('Creating a new room', RoomsController.name);
    const result = await this.roomsService.create(createRoomDto);
    this.logger.log('Room created successfully', RoomsController.name);
    return result;
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all rooms', RoomsController.name);
    const result = await this.roomsService.findAll();
    this.logger.log(`Found ${result.length} rooms`, RoomsController.name);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching room by ID: ${id}`, RoomsController.name);
    const result = await this.roomsService.findOne(id);
    this.logger.log(`Room found: ${id}`, RoomsController.name);
    return result;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return await this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.roomsService.remove(id);
  }
}
