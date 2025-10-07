import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { roomAssignments } from 'src/db/tables';

export const createRoomAssignmentSchema = createInsertSchema(roomAssignments)
  .omit({ id: true, createdAt: true })
  .extend({
    roomId: z.uuid().describe('The ID of the room'),
    employeeId: z.uuid().describe('The ID of the employee'),
    preferences: z
      .string()
      .max(256)
      .optional()
      .describe('The preferences of the room assignment'),
  });

export class CreateRoomAssignmentDto extends createZodDto(
  createRoomAssignmentSchema,
) {}
