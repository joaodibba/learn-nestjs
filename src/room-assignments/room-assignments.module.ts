import { Module } from '@nestjs/common';
import { RoomAssignmentsService } from './room-assignments.service';
import { RoomAssignmentsController } from './room-assignments.controller';
import { DatabaseModule } from '../db/database.module';
import { PaginationService } from '../services/pagination.service';
import { RequestContextService } from '../services/request-context.service';
import { ResourceLinksService } from '../services/resource-links.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RoomAssignmentsController],
  providers: [RoomAssignmentsService, PaginationService, RequestContextService, ResourceLinksService],
})
export class RoomAssignmentsModule {}
