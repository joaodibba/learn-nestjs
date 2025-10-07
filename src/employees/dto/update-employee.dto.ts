import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto, createEmployeeSchema } from './create-employee.dto';

export const updateEmployeeSchema = createEmployeeSchema.partial();

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
