import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';
import { employees } from 'src/db/tables';
import { z } from 'zod';

export const createEmployeeSchema = createInsertSchema(employees)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1).max(100).describe('The name of the employee'),
    email: z.email().describe('The email of the employee'),
  });

export class CreateEmployeeDto extends createZodDto(createEmployeeSchema) {}
