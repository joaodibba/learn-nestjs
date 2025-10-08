import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { stringFilterSchema } from 'drizzle-filters';

const employeeFilterSchema = z.object({
  name: stringFilterSchema.describe('Filter by Name'),
  email: stringFilterSchema.describe('Filter by Email'),
}).describe('Employee Filter');

export class EmployeeFilterDto extends createZodDto(employeeFilterSchema) {}
