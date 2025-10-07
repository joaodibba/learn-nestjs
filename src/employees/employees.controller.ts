import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationQueryDto } from '../services/dto/pagination.dto';
import { ResourceLinksInterceptor } from '../interceptors/resource-links.interceptor';
import {
  ResourceLinks,
  ResourceRelationships,
  selfLink,
  updateLink,
  deleteLink,
  nestedLink,
  relatedLink,
  relationship,
} from '../decorators/resource-links.decorator';

@ApiTags('employees')
@Controller('employees')
@UseInterceptors(ResourceLinksInterceptor)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ResourceLinks([
    selfLink('employees'),
    updateLink('employees'),
    deleteLink('employees'),
  ])
  @ResourceRelationships([
    relationship('room-assignments', 'room-assignments'),
    relationship('department', 'departments'),
  ])
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees ' })
  @ApiResponse({ status: 200, description: 'Employees fetched successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ResourceLinks([
    selfLink('employees'),
    {
      name: 'create',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/employees`;
      },
      method: 'POST',
      title: 'Create Employee',
    },
  ])
  async findAll(@Query() pagination: PaginationQueryDto) {
    return await this.employeesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee fetched successfully' })
  @ResourceLinks([
    selfLink('employees'),
    updateLink('employees'),
    deleteLink('employees'),
    // Nested resource links
    nestedLink('room-assignments', 'room-assignments'),
    nestedLink('documents', 'documents'),
    // Related resource links
    relatedLink('department', 'departments'),
    relatedLink('manager', 'employees'),
  ])
  @ResourceRelationships([
    relationship('room-assignments', 'room-assignments'),
    relationship('documents', 'documents'),
    relationship('department', 'departments'),
    relationship('manager', 'employees'),
  ])
  async findOne(@Param('id') id: string) {
    return await this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ResourceLinks([
    selfLink('employees'),
    updateLink('employees'),
    deleteLink('employees'),
  ])
  @ResourceRelationships([
    relationship('room-assignments', 'room-assignments'),
    relationship('department', 'departments'),
  ])
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return await this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ResourceLinks([
    selfLink('employees'),
  ])
  async remove(@Param('id') id: string) {
    return await this.employeesService.remove(id);
  }
}
