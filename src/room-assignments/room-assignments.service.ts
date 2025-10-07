import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { roomAssignments } from '../db/tables';
import { eq, count } from 'drizzle-orm';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';
import { PaginationQuery } from '../types/pagination.types';
import { PaginationService } from '../services/pagination.service';
import { ResourceLinksService } from '../services/resource-links.service';

@Injectable()
export class RoomAssignmentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly paginationService: PaginationService,
    private readonly resourceLinksService: ResourceLinksService,
  ) {}

  async findAll(pagination?: PaginationQuery) {
    const db = this.databaseService.getDatabase();

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const offset = (page - 1) * limit;

    const [{ total }] = await db.select({ total: count() }).from(roomAssignments);

    const rawData = await db.query.roomAssignments.findMany({
      limit,
      offset,
      with: {
        employee: true,
      }
    });

    // Transform to resource items with links
    const data = this.resourceLinksService.transformToResourceItems(rawData, 'room-assignment');

    const meta = this.paginationService.generateMeta(total, page, limit);
    const links = this.paginationService.generateLinks(meta);

    return {
      links,
      data,
      meta,
    };
  }

  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    const assignments = await db.query.roomAssignments.findMany({
      where: eq(roomAssignments.employeeId, id),
    });

    if (!assignments || assignments.length === 0) {
      return null;
    }

    // Transform to resource items with links
    const data = this.resourceLinksService.transformToResourceItems(assignments, 'room-assignment');

    return { data };
  }

  async create(createRoomAssignmentDto: CreateRoomAssignmentDto) {
    const db = this.databaseService.getDatabase();
    const [newRoomAssignment] = await db.insert(roomAssignments).values(createRoomAssignmentDto).returning();
    
    const data = this.resourceLinksService.transformToResourceItem(newRoomAssignment, 'room-assignment');

    return { data };
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
