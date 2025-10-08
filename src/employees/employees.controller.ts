import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UuidParamDto } from 'src/common/dto/uuid.dto';
import { EmployeeFilterDto } from './dto/employee-filter.dto';
import { FilterQuery } from 'src/common/decorators/api-filter.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeesService.create(createEmployeeDto);
  }

  @Get()
  async findAll(@FilterQuery() filters?: EmployeeFilterDto) {
    return await this.employeesService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param() params: UuidParamDto) {
    return await this.employeesService.findOne(params.id);
  }

  @Patch(':id')
  async update(
    @Param() params: UuidParamDto,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return await this.employeesService.update(params.id, updateEmployeeDto);
  }

  @Delete(':id')
  async remove(@Param() params: UuidParamDto) {
    return await this.employeesService.remove(params.id);
  }
}
