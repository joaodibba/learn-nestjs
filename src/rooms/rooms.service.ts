import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { rooms } from '../db/tables';
import { eq } from 'drizzle-orm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const db = this.databaseService.getDatabase();
    return await db.query.rooms.findMany();
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
