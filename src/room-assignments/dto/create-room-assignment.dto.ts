import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { roomAssignments } from 'src/db/tables';

export const selectRoomAssignmentsSchema = createSelectSchema(roomAssignments);
export const insertRoomAssignmentsSchema = createInsertSchema(roomAssignments);

export const createRoomAssignmentSchema = insertRoomAssignmentsSchema
  .omit({ id: true, createdAt: true })
  .extend({
    roomId: z.uuid(),
    employeeId: z.uuid(),
    preferences: z.string().max(256).optional(),
  });

export class CreateRoomAssignmentDto extends createZodDto(createRoomAssignmentSchema) {}
