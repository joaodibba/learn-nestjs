# Migration Guide: From Simple to Complex Resource Links

## Before (Simple Approach)

```typescript
// Old way - hardcoded links
@Controller('employees')
export class EmployeesController {
  async findOne(@Param('id') id: string, @RequestContext() request: any) {
    const employee = await this.employeesService.findOne(id, request);
    return { data: employee };
  }
}

// Service had to manually transform
async findOne(id: string, request?: any) {
  const employee = await this.db.query.employees.findFirst({ where: eq(employees.id, id) });
  const data = this.resourceLinksService.transformToResourceItem(employee, 'employee', request);
  return { data };
}
```

## After (Flexible Approach)

```typescript
// New way - declarative links with conditions
@Controller('employees')
@UseInterceptors(ResourceLinksInterceptor)
export class EmployeesController {
  
  @Get(':id')
  @ResourceLinks([
    selfLink(),
    updateLink(),
    deleteLink(),
    // Conditional links
    {
      name: 'activate',
      href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/activate`,
      method: 'POST',
      condition: (resource) => resource.status === 'inactive',
    },
    // Nested resources
    nestedLink('room-assignments', 'room-assignments'),
    nestedLink('documents', 'documents'),
  ])
  @ResourceRelationships([
    relationship('room-assignments', 'room-assignments'),
    relationship('documents', 'documents'),
  ])
  async findOne(@Param('id') id: string) {
    // Just return the raw data - links are generated automatically!
    return await this.employeesService.findOne(id);
  }
}
```

## Key Benefits

### 1. **Conditional Links**
```typescript
// Show different links based on resource state
{
  name: 'activate',
  href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/activate`,
  condition: (resource) => resource.status === 'inactive',
}
```

### 2. **Nested Resources**
```typescript
// Automatically generate nested resource links
nestedLink('room-assignments', 'room-assignments'),
nestedLink('documents', 'documents'),
```

### 3. **Relationships**
```typescript
// Define resource relationships
@ResourceRelationships([
  relationship('room-assignments', 'room-assignments'),
  relationship('department', 'departments'),
])
```

### 4. **Custom Links**
```typescript
// Any custom link you need
{
  name: 'export-pdf',
  href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/export/pdf`,
  method: 'GET',
  title: 'Export as PDF',
}
```

### 5. **Method-specific Links**
```typescript
// Different links for different HTTP methods
@Get(':id')
@ResourceLinks([selfLink(), updateLink(), deleteLink()])

@Post(':id/activate')
@ResourceLinks([selfLink(), {
  name: 'deactivate',
  href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/deactivate`,
  method: 'POST',
}])
```

## Migration Steps

1. **Add the interceptor to your controller:**
   ```typescript
   @UseInterceptors(ResourceLinksInterceptor)
   ```

2. **Remove manual link generation from services:**
   ```typescript
   // Remove this
   const data = this.resourceLinksService.transformToResourceItem(employee, 'employee', request);
   
   // Just return raw data
   return employee;
   ```

3. **Add decorators to controller methods:**
   ```typescript
   @ResourceLinks([selfLink(), updateLink(), deleteLink()])
   ```

4. **Remove RequestContext parameters:**
   ```typescript
   // Remove @RequestContext() request: any parameter
   async findOne(@Param('id') id: string) {
     return await this.employeesService.findOne(id);
   }
   ```

5. **Update service methods:**
   ```typescript
   // Remove request parameter
   async findOne(id: string) {
     return await this.db.query.employees.findFirst({ where: eq(employees.id, id) });
   }
   ```

## Advanced Examples

### Complex Employee with Multiple States
```typescript
@Get(':id')
@ResourceLinks([
  selfLink(),
  updateLink(),
  deleteLink(),
  // Status-based actions
  {
    name: 'activate',
    href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/activate`,
    method: 'POST',
    condition: (resource) => resource.status === 'inactive',
  },
  {
    name: 'deactivate',
    href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/deactivate`,
    method: 'POST',
    condition: (resource) => resource.status === 'active',
  },
  {
    name: 'terminate',
    href: (resource, request) => `${getBaseUrl(request)}/employees/${resource.id}/terminate`,
    method: 'POST',
    condition: (resource) => ['active', 'inactive'].includes(resource.status),
  },
  // Nested resources
  nestedLink('room-assignments', 'room-assignments'),
  nestedLink('performance-reviews', 'reviews'),
  nestedLink('documents', 'documents'),
  nestedLink('timesheets', 'timesheets'),
  // Related resources
  relatedLink('department', 'departments'),
  relatedLink('manager', 'employees'),
])
```

### Room with Booking System
```typescript
@Get(':id')
@ResourceLinks([
  selfLink(),
  updateLink(),
  deleteLink(),
  // Booking-related links
  {
    name: 'book',
    href: (resource, request) => `${getBaseUrl(request)}/rooms/${resource.id}/book`,
    method: 'POST',
    condition: (resource) => resource.status === 'available',
  },
  {
    name: 'cancel-booking',
    href: (resource, request) => `${getBaseUrl(request)}/rooms/${resource.id}/cancel-booking`,
    method: 'POST',
    condition: (resource) => resource.status === 'booked',
  },
  {
    name: 'maintenance',
    href: (resource, request) => `${getBaseUrl(request)}/rooms/${resource.id}/maintenance`,
    method: 'POST',
    condition: (resource) => resource.status === 'available',
  },
  // Nested resources
  nestedLink('bookings', 'bookings'),
  nestedLink('assignments', 'assignments'),
  nestedLink('maintenance-history', 'maintenance'),
])
```

This new system is much more powerful and flexible than the previous approach!
