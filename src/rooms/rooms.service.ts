import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { rooms } from '../db/tables';
import { eq, count } from 'drizzle-orm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationQuery } from '../types/pagination.types';
import { PaginationService } from '../services/pagination.service';
import { ResourceLinksService } from '../services/resource-links.service';

@Injectable()
export class RoomsService {
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

    const [{ total }] = await db.select({ total: count() }).from(rooms);

    const rawData = await db.query.rooms.findMany({
      limit,
      offset,
    });

    // Transform to resource items with links
    const data = this.resourceLinksService.transformToResourceItems(rawData, 'room');

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
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
    });

    if (!room) {
      return null;
    }

    const data = this.resourceLinksService.transformToResourceItem(room, 'room');

    return { data };
  }

  async create(createRoomDto: CreateRoomDto) {
    const db = this.databaseService.getDatabase();
    const [newRoom] = await db.insert(rooms).values(createRoomDto).returning();
    
    const data = this.resourceLinksService.transformToResourceItem(newRoom, 'room');

    return { data };
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
