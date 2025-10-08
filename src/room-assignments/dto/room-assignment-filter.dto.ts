import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { stringFilterSchema } from 'drizzle-filters';

const roomAssignmentFilterSchema = z.object({
  roomId: stringFilterSchema.describe('Filter by Room ID'),
  employeeId: stringFilterSchema.describe('Filter by Employee ID'),
  preferences: stringFilterSchema.describe('Filter by Preferences'),
});

export class RoomAssignmentFilterDto extends createZodDto(roomAssignmentFilterSchema) {}


