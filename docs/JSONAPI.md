# JSON:API v1.1 Implementation Guide

This NestJS backend implements a fully JSON:API v1.1 compliant response layer that automatically wraps all API responses according to the [JSON:API specification](https://jsonapi.org/format/1.1/).

## Features

- ✅ **Automatic JSON:API wrapping** - All responses are automatically formatted
- ✅ **Pagination support** - Built-in pagination with proper links and meta
- ✅ **Error formatting** - Errors are formatted according to JSON:API spec
- ✅ **Resource relationships** - Support for relationships between resources
- ✅ **Resource links** - Automatic generation of HATEOAS links
- ✅ **Customizable** - Easy to customize per resource type
- ✅ **Future-proof** - Follows JSON:API v1.1 specification

## Quick Start

### Basic Usage

All endpoints automatically return JSON:API formatted responses. No additional code needed!

```typescript
@Controller('rooms')
@JsonApiType('rooms')  // Specify resource type
export class RoomsController {
  @Get()
  async findAll() {
    return await this.roomsService.findAll();
  }
}
```

**Response:**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": [
    {
      "type": "rooms",
      "id": "1",
      "attributes": {
        "name": "Conference Room A",
        "capacity": 10
      }
    }
  ],
  "links": {
    "self": "http://localhost:3000/rooms"
  }
}
```

### Pagination

Paginated responses include meta and pagination links:

```typescript
@Get()
async findAll(@Query() pagination: PaginationQueryDto) {
  return await this.roomsService.findAll(pagination);
}
```

**Request:** `GET /rooms?page=2&limit=10`

**Response:**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": [...],
  "meta": {
    "page": {
      "total": 50,
      "size": 10,
      "number": 2,
      "totalPages": 5
    }
  },
  "links": {
    "self": "http://localhost:3000/rooms?page=2&limit=10",
    "first": "http://localhost:3000/rooms?page=1&limit=10",
    "prev": "http://localhost:3000/rooms?page=1&limit=10",
    "next": "http://localhost:3000/rooms?page=3&limit=10",
    "last": "http://localhost:3000/rooms?page=5&limit=10"
  }
}
```

### Error Handling

Errors are automatically formatted according to JSON:API:

**Response (400 Bad Request):**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "errors": [
    {
      "status": "400",
      "title": "Validation Error",
      "detail": "Name must be at least 3 characters",
      "source": {
        "pointer": "/data/attributes/name"
      }
    }
  ],
  "links": {
    "about": "http://localhost:3000/rooms"
  }
}
```

## Advanced Usage

### Resource Relationships

Add relationships between resources:

```typescript
@Controller('rooms')
@UseInterceptors(ResourceLinksInterceptor)
export class RoomsController {
  @Get(':id')
  @ResourceRelationships([
    relationship('assignments', 'room-assignments'),
    relationship('building', 'buildings'),
  ])
  async findOne(@Param('id') id: string) {
    return await this.roomsService.findOne(id);
  }
}
```

**Response:**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": {
    "type": "rooms",
    "id": "1",
    "attributes": {
      "name": "Conference Room A"
    },
    "relationships": {
      "assignments": {
        "links": {
          "self": "http://localhost:3000/room-assignments",
          "related": "http://localhost:3000/room-assignments"
        }
      },
      "building": {
        "links": {
          "self": "http://localhost:3000/buildings",
          "related": "http://localhost:3000/buildings"
        }
      }
    }
  }
}
```

### Custom Links

Add custom HATEOAS links to resources:

```typescript
@Get(':id')
@ResourceLinks([
  selfLink('rooms'),
  updateLink('rooms'),
  deleteLink('rooms'),
  {
    name: 'book',
    href: (resource, request) => {
      const baseUrl = request.protocol + '://' + request.get('host');
      return `${baseUrl}/rooms/${resource.id}/book`;
    },
    method: 'POST',
    title: 'Book Room',
  },
])
async findOne(@Param('id') id: string) {
  return await this.roomsService.findOne(id);
}
```

**Response:**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": {
    "type": "rooms",
    "id": "1",
    "attributes": {
      "name": "Conference Room A"
    },
    "links": {
      "self": "http://localhost:3000/rooms/1",
      "update": "http://localhost:3000/rooms/1",
      "delete": "http://localhost:3000/rooms/1",
      "book": "http://localhost:3000/rooms/1/book"
    }
  }
}
```

### Disable JSON:API for Specific Endpoints

If you need to disable JSON:API serialization for a specific endpoint:

```typescript
@Get('health')
@JsonApiSerialize(false)  // Disable JSON:API for this endpoint
async health() {
  return { status: 'ok' };
}
```

## Service Layer Pattern

Your services should return data in one of these formats:

### Single Resource
```typescript
async findOne(id: string) {
  const room = await this.db.query.rooms.findFirst({ where: eq(rooms.id, id) });
  return { data: room };
}
```

### Multiple Resources
```typescript
async findAll() {
  const rooms = await this.db.query.rooms.findMany();
  return { data: rooms };
}
```

### Paginated Resources
```typescript
async findAll(pagination: PaginationQuery) {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;
  
  const [{ total }] = await db.select({ total: count() }).from(rooms);
  const data = await db.query.rooms.findMany({ limit, offset });
  
  const meta = this.paginationService.generateMeta(total, page, limit);
  
  return {
    data,
    meta,
  };
}
```

## Architecture

### Components

1. **JsonApiInterceptor** - Main interceptor that transforms responses
2. **JsonApiErrorFilter** - Error filter that formats errors
3. **JsonApiType** - Decorator to specify resource type
4. **JsonApiSerialize** - Decorator to enable/disable serialization
5. **ResourceLinksInterceptor** - Adds custom HATEOAS links (optional)

### Interceptor Order

The interceptors run in this order:
1. `ZodSerializerInterceptor` - Validates response schema
2. `JsonApiInterceptor` - Wraps response in JSON:API format
3. `ResourceLinksInterceptor` - Adds custom links (if used)

### Error Handling

The error filter chain:
1. `HttpExceptionFilter` - Logs errors
2. `JsonApiErrorFilter` - Formats errors as JSON:API

## Best Practices

### 1. Always Specify Resource Type
```typescript
@Controller('rooms')
@JsonApiType('rooms')  // ✅ Good
export class RoomsController {}
```

### 2. Use Pagination for Lists
```typescript
@Get()
async findAll(@Query() pagination: PaginationQueryDto) {  // ✅ Good
  return await this.service.findAll(pagination);
}
```

### 3. Return Wrapped Data from Services
```typescript
// ✅ Good
return { data: room };

// ❌ Avoid
return room;
```

### 4. Include Meta Information
```typescript
// ✅ Good
return {
  data: rooms,
  meta: {
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10,
  }
};
```

### 5. Use TypeScript Types
```typescript
import { JsonApiDocument, JsonApiResource } from './types/jsonapi.types';

// ✅ Good - type-safe
const doc: JsonApiDocument = { ... };
```

## Testing

### Example Test
```typescript
describe('RoomsController', () => {
  it('should return JSON:API formatted response', async () => {
    const response = await request(app.getHttpServer())
      .get('/rooms')
      .expect(200);
    
    expect(response.body).toHaveProperty('jsonapi');
    expect(response.body.jsonapi.version).toBe('1.1');
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    if (response.body.data.length > 0) {
      const resource = response.body.data[0];
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('attributes');
    }
  });
});
```

## Migration from Old Implementation

If you have existing code using the old `ResourceLinksInterceptor` pattern:

### Before
```typescript
async findOne(id: string, request?: any) {
  const room = await this.db.query.rooms.findFirst({ where: eq(rooms.id, id) });
  return this.resourceLinksService.transformToResourceItem(room, 'rooms', request);
}
```

### After
```typescript
async findOne(id: string) {
  const room = await this.db.query.rooms.findFirst({ where: eq(rooms.id, id) });
  return { data: room };  // JSON:API interceptor handles the rest
}
```

## Troubleshooting

### Issue: Resource type is "resources" instead of expected type
**Solution:** Add `@JsonApiType('your-type')` decorator to controller

### Issue: Links are not generated
**Solution:** Ensure `ResourceLinksInterceptor` is added with `@UseInterceptors(ResourceLinksInterceptor)`

### Issue: Pagination links are wrong
**Solution:** Ensure your service returns `meta` with `page`, `limit`, and `total` fields

### Issue: Errors are not formatted
**Solution:** Ensure `JsonApiErrorFilter` is registered in `app.module.ts`

## Reference

- [JSON:API Specification v1.1](https://jsonapi.org/format/1.1/)
- [JSON:API Examples](https://jsonapi.org/examples/)
- [JSON:API Best Practices](https://jsonapi.org/recommendations/)
