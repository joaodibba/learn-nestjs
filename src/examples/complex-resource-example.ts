import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
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

/**
 * Example: Complex Employee Resource with Multiple Links and Relationships
 */
@Controller('employees')
@UseInterceptors(ResourceLinksInterceptor)
export class ComplexEmployeeController {
  
  @Get()
  @ResourceLinks([
    selfLink(),
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
  async findAll() {
    // Your service logic here
    return {
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
      ],
    };
  }

  @Get(':id')
  @ResourceLinks([
    selfLink(),
    updateLink(),
    deleteLink(),
    // Conditional link - only show for active employees
    {
      name: 'deactivate',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/employees/${resource.id}/deactivate`;
      },
      method: 'POST',
      title: 'Deactivate Employee',
      condition: (resource) => resource.status === 'active',
    },
    // Conditional link - only show for inactive employees
    {
      name: 'activate',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/employees/${resource.id}/activate`;
      },
      method: 'POST',
      title: 'Activate Employee',
      condition: (resource) => resource.status === 'inactive',
    },
    // Nested resource links
    nestedLink('room-assignments', 'room-assignments'),
    nestedLink('performance-reviews', 'reviews'),
    nestedLink('documents', 'documents'),
    // Related resource links
    relatedLink('department', 'departments'),
    relatedLink('manager', 'employees'),
  ])
  @ResourceRelationships([
    relationship('room-assignments', 'room-assignments'),
    relationship('performance-reviews', 'reviews'),
    relationship('documents', 'documents'),
    relationship('department', 'departments'),
    relationship('manager', 'employees'),
  ])
  async findOne(@Param('id') id: string) {
    // Your service logic here
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      departmentId: 'dept-1',
      managerId: 'mgr-1',
    };
  }

  @Get(':id/room-assignments')
  @ResourceLinks([
    selfLink(),
    {
      name: 'assign-room',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/employees/${resource.employeeId}/room-assignments`;
      },
      method: 'POST',
      title: 'Assign Room',
    },
  ])
  @ResourceRelationships([
    relationship('employee', 'employees'),
    relationship('room', 'rooms'),
  ])
  async getRoomAssignments(@Param('id') id: string) {
    // Your service logic here
    return {
      data: [
        {
          id: 'ra-1',
          employeeId: id,
          roomId: 'room-1',
          startDate: '2024-01-01',
          endDate: null,
        },
      ],
    };
  }

  @Post(':id/room-assignments')
  @ResourceLinks([
    selfLink(),
    updateLink(),
    deleteLink(),
  ])
  @ResourceRelationships([
    relationship('employee', 'employees'),
    relationship('room', 'rooms'),
  ])
  async assignRoom(@Param('id') id: string, @Body() assignmentData: any) {
    // Your service logic here
    return {
      id: 'ra-new',
      employeeId: id,
      roomId: assignmentData.roomId,
      startDate: new Date().toISOString(),
      endDate: null,
    };
  }
}

/**
 * Example: Complex Room Resource with Status-based Links
 */
@Controller('rooms')
@UseInterceptors(ResourceLinksInterceptor)
export class ComplexRoomController {
  
  @Get(':id')
  @ResourceLinks([
    selfLink(),
    updateLink(),
    deleteLink(),
    // Conditional links based on room status
    {
      name: 'book',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/rooms/${resource.id}/book`;
      },
      method: 'POST',
      title: 'Book Room',
      condition: (resource) => resource.status === 'available',
    },
    {
      name: 'cancel-booking',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/rooms/${resource.id}/cancel-booking`;
      },
      method: 'POST',
      title: 'Cancel Booking',
      condition: (resource) => resource.status === 'booked',
    },
    {
      name: 'maintenance',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/rooms/${resource.id}/maintenance`;
      },
      method: 'POST',
      title: 'Schedule Maintenance',
      condition: (resource) => resource.status === 'available',
    },
    // Nested resources
    nestedLink('assignments', 'assignments'),
    nestedLink('bookings', 'bookings'),
    nestedLink('maintenance-history', 'maintenance'),
    // Related resources
    relatedLink('building', 'buildings'),
    relatedLink('floor', 'floors'),
  ])
  @ResourceRelationships([
    relationship('assignments', 'room-assignments'),
    relationship('bookings', 'bookings'),
    relationship('maintenance-history', 'maintenance'),
    relationship('building', 'buildings'),
    relationship('floor', 'floors'),
  ])
  async findOne(@Param('id') id: string) {
    // Your service logic here
    return {
      id,
      number: '101',
      floor: 1,
      capacity: 4,
      status: 'available',
      buildingId: 'building-1',
      floorId: 'floor-1',
    };
  }
}

/**
 * Example: Department Resource with Hierarchical Relationships
 */
@Controller('departments')
@UseInterceptors(ResourceLinksInterceptor)
export class ComplexDepartmentController {
  
  @Get(':id')
  @ResourceLinks([
    selfLink(),
    updateLink(),
    deleteLink(),
    // Hierarchical links
    {
      name: 'parent',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return resource.parentId ? `${baseUrl}/departments/${resource.parentId}` : null;
      },
      method: 'GET',
      title: 'Parent Department',
      condition: (resource) => !!resource.parentId,
    },
    {
      name: 'children',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/departments?parent=${resource.id}`;
      },
      method: 'GET',
      title: 'Child Departments',
    },
    // Nested resources
    nestedLink('employees', 'employees'),
    nestedLink('budget', 'budget'),
    nestedLink('projects', 'projects'),
    // Related resources
    relatedLink('manager', 'employees'),
    relatedLink('company', 'companies'),
  ])
  @ResourceRelationships([
    relationship('parent', 'departments'),
    relationship('children', 'departments'),
    relationship('employees', 'employees'),
    relationship('budget', 'budgets'),
    relationship('projects', 'projects'),
    relationship('manager', 'employees'),
    relationship('company', 'companies'),
  ])
  async findOne(@Param('id') id: string) {
    // Your service logic here
    return {
      id,
      name: 'Engineering',
      parentId: 'dept-1',
      managerId: 'emp-1',
      companyId: 'comp-1',
    };
  }
}
