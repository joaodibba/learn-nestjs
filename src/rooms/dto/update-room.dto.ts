import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto, createRoomSchema } from './create-room.dto';

export const updateRoomSchema = createRoomSchema.partial();

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
