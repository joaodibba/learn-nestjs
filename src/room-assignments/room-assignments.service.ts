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
import { RoomAssignmentFilterDto } from './dto/room-assignment-filter.dto';
import { fi } from 'zod/v4/locales';
import { FilterBuilder } from 'drizzle-filters';

@Injectable()
export class RoomAssignmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(filters?: RoomAssignmentFilterDto) {
    const db = this.databaseService.getDatabase();
    const baseQuery = db.select().from(roomAssignments);

    if (!filters) {
      const results = await baseQuery;
      if (!results.length)
        throw new NotFoundException('No room assignments found');
      return results;
    }

    const where = FilterBuilder.buildWhere([
      { filter: filters.roomId, column: roomAssignments.roomId, type: 'string' },
      { filter: filters.employeeId, column: roomAssignments.employeeId, type: 'string' },
      { filter: filters.preferences , column: roomAssignments.preferences, type: 'string' },
    ]);

    const results = await baseQuery.where(where);

    if (!results.length)
      throw new NotFoundException('No room assignments found matching the criteria');

    return results;
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
