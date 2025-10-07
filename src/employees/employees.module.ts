import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DatabaseModule } from '../db/database.module';
import { PaginationService } from '../services/pagination.service';
import { ResourceLinksService } from '../services/resource-links.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, PaginationService, ResourceLinksService],
})
export class EmployeesModule {}
