import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { roomAssignments } from '../db/tables';
import { eq } from 'drizzle-orm';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';

@Injectable()
export class RoomAssignmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const db = this.databaseService.getDatabase();
    return await db.query.roomAssignments.findMany({
      with: {
        employee: true,
      }
    });
  }

  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    return await db.query.roomAssignments.findMany({
      where: eq(roomAssignments.employeeId, id),
    });
  }

  async create(createRoomAssignmentDto: CreateRoomAssignmentDto) {
    const db = this.databaseService.getDatabase();
    const [newRoomAssignment] = await db.insert(roomAssignments).values(createRoomAssignmentDto).returning();
    return newRoomAssignment;
  }

  async update(id: string, updateRoomAssignmentDto: UpdateRoomAssignmentDto) {
    // TODO: Implement update functionality
    return `This action updates a #${id} roomAssignment`;
  }

  async remove(id: string) {
    // TODO: Implement remove functionality
    return `This action removes a #${id} roomAssignment`;
  }
}
