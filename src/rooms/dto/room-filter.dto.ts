import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { numberFilterSchema, stringFilterSchema } from 'drizzle-filters';

const roomFilterSchema = z.object({
    id: stringFilterSchema.describe('Filter by Room ID'),
    roomNumber: stringFilterSchema.describe('Filter by Room Number'),
    name: stringFilterSchema.describe('Filter by Room Name'),
    capacity: numberFilterSchema.describe('Filter by Room Capacity'),
});

export class RoomFilterDto extends createZodDto(roomFilterSchema) {}


