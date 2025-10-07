import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoomAssignmentsService } from './room-assignments.service';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';

@Controller('room-assignments')
export class RoomAssignmentsController {
  constructor(
    private readonly roomAssignmentsService: RoomAssignmentsService,
  ) {}

  @Post()
  async create(@Body() createRoomAssignmentDto: CreateRoomAssignmentDto) {
    return await this.roomAssignmentsService.create(createRoomAssignmentDto);
  }

  @Get()
  async findAll() {
    return await this.roomAssignmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.roomAssignmentsService.findOne(id);
  }

  @Patch(':id')
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
  async remove(@Param('id') id: string) {
    return await this.roomAssignmentsService.remove(id);
  }
}
