import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
      },
    });
  }

  /**
   * Find all room assignments for a specific employee by employee ID
   * @param id - The employee UUID
   * @returns Array of room assignments for the employee
   */
  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    const assignment = await db.query.roomAssignments.findFirst({
      where: eq(roomAssignments.employeeId, id),
      with: {
        employee: true,
        room: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `No room assignments found for employee with ID: ${id}`,
      );
    }

    return assignment;
  }

  async create(createRoomAssignmentDto: CreateRoomAssignmentDto) {
    const db = this.databaseService.getDatabase();
    const [newRoomAssignment] = await db
      .insert(roomAssignments)
      .values(createRoomAssignmentDto)
      .returning();
    if (!newRoomAssignment) {
      throw new BadRequestException(
        `Failed to create room assignment: ${createRoomAssignmentDto}`,
      );
    }
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
