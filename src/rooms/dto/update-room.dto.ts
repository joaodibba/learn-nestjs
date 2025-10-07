import { createZodDto } from 'nestjs-zod';
import { createRoomSchema } from './create-room.dto';

export class UpdateRoomDto extends createZodDto(createRoomSchema.partial()) {}
