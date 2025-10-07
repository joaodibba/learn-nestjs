import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}
