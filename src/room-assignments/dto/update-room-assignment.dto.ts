import { PartialType } from '@nestjs/swagger';
import { CreateRoomAssignmentDto, createRoomAssignmentSchema } from './create-room-assignment.dto';

export const updateRoomAssignmentSchema = createRoomAssignmentSchema.partial();

export class UpdateRoomAssignmentDto extends PartialType(CreateRoomAssignmentDto) {}
