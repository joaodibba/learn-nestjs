import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.uuid('Invalid UUID format'),
});

export class UuidParamDto extends createZodDto(uuidParamSchema) {}
