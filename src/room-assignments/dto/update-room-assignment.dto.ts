import { createZodDto } from 'nestjs-zod';
import { createRoomAssignmentSchema } from './create-room-assignment.dto';

export class UpdateRoomAssignmentDto extends createZodDto(
  createRoomAssignmentSchema.partial(),
) {}
