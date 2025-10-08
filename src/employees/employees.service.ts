import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { employees } from '../db/tables';
import { eq } from 'drizzle-orm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFilterDto } from './dto/employee-filter.dto';
import { FilterBuilder, FilterMapping } from 'drizzle-filters';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(filters?: EmployeeFilterDto) {
    const db = this.databaseService.getDatabase();
    const baseQuery = db.select().from(employees);

    if (!filters) {
      const results = await baseQuery;
      if (!results.length) throw new NotFoundException('No employees found');
      return results;
    }

    // Build dynamic WHERE conditions
    const where = FilterBuilder.buildWhere([
      { filter: filters.name, column: employees.name, type: 'string' },
      { filter: filters.email, column: employees.email, type: 'string' },
    ]);

    const results = await baseQuery.where(where);

    if (!results.length)
      throw new NotFoundException('No employees found matching the criteria');

    return results;
  }

  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    return await db.query.employees.findFirst({
      where: eq(employees.id, id),
    });
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    const db = this.databaseService.getDatabase();
    const [newEmployee] = await db
      .insert(employees)
      .values(createEmployeeDto)
      .returning();
    return newEmployee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // TODO: Implement update functionality
    return `This action updates a #${id} employee`;
  }

  async remove(id: string) {
    const db = this.databaseService.getDatabase();
    await db.delete(employees).where(eq(employees.id, id));
  }
}
