import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { rooms } from '../db/tables';
import { eq } from 'drizzle-orm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomFilterDto } from './dto/room-filter.dto';
import { FilterBuilder } from 'drizzle-filters';

@Injectable()
export class RoomsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(filters?: RoomFilterDto) {
    const db = this.databaseService.getDatabase();
    const baseQuery = db.select().from(rooms);

    if (!filters) {
      const results = await baseQuery;
      if (!results.length) throw new Error('No rooms found');
      return results;
    }

    const where = FilterBuilder.buildWhere([
      { filter: filters.name, column: rooms.name, type: 'string' },
      { filter: filters.roomNumber, column: rooms.roomNumber, type: 'string' },
      { filter: filters.capacity, column: rooms.capacity, type: 'number' },
    ]);

    const results = await baseQuery.where(where);
    
    if (!results.length)
      throw new NotFoundException('No rooms found matching the criteria');

    return results; 
  }

  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
    });
    return room;
  }

  async create(createRoomDto: CreateRoomDto) {
    const db = this.databaseService.getDatabase();
    const [newRoom] = await db.insert(rooms).values(createRoomDto).returning();
    return newRoom;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    // TODO: Implement update functionality
    return `This action updates a #${id} room`;
  }

  async remove(id: string) {
    const db = this.databaseService.getDatabase();
    await db.delete(rooms).where(eq(rooms.id, id));
  }
}
