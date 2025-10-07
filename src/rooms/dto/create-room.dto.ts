import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { rooms } from 'src/db/tables';

export const selectRoomsSchema = createSelectSchema(rooms);
export const insertRoomsSchema = createInsertSchema(rooms);

export const createRoomSchema = insertRoomsSchema
  .omit({ id: true, createdAt: true })
  .extend({
    roomNumber: z
      .string()
      .min(1)
      .max(10)
      .describe('The room number identifier'),
    name: z.string().min(1).max(256).describe('The name of the room'),
    capacity: z
      .number()
      .int()
      .positive()
      .min(1)
      .max(10)
      .describe('The maximum capacity of the room'),
  });

export class CreateRoomDto extends createZodDto(createRoomSchema) {}
