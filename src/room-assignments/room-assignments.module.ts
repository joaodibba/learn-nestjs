import { Module } from '@nestjs/common';
import { RoomAssignmentsService } from './room-assignments.service';
import { RoomAssignmentsController } from './room-assignments.controller';
import { DatabaseModule } from '../db/database.module';
import { PaginationService } from '../services/pagination.service';
import { ResourceLinksService } from '../services/resource-links.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RoomAssignmentsController],
  providers: [RoomAssignmentsService, PaginationService, ResourceLinksService],
})
export class RoomAssignmentsModule {}
