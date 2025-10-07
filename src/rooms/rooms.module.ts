import { Module, Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { DatabaseModule } from '../db/database.module';
import { PaginationService } from '../services/pagination.service';
import { RequestContextService } from '../services/request-context.service';
import { ResourceLinksService } from '../services/resource-links.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RoomsController],
  providers: [RoomsService, Logger, PaginationService, RequestContextService, ResourceLinksService],
})
export class RoomsModule {}
