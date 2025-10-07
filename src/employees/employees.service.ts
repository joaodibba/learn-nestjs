import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { employees } from '../db/tables';
import { eq } from 'drizzle-orm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const db = this.databaseService.getDatabase();
    return await db.query.employees.findMany();
  }

  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    return await db.query.employees.findFirst({
      where: eq(employees.id, id),
    });
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    const db = this.databaseService.getDatabase();
    const [newEmployee] = await db.insert(employees).values(createEmployeeDto).returning();
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
