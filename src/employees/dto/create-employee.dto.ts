import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';
import { employees } from 'src/db/tables';
import { z } from 'zod';


export const selectEmployeesSchema = createSelectSchema(employees);
export const insertEmployeesSchema = createInsertSchema(employees);

export const createEmployeeSchema = insertEmployeesSchema
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1).max(100),
    email: z.email(),
  });

export class CreateEmployeeDto extends createZodDto(createEmployeeSchema) {}
