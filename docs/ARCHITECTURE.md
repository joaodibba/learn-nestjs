# JSON:API Architecture

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                             │
│                    GET /rooms?page=1&limit=10                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Middleware                               │
│                  (Authentication, CORS, etc.)                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Validation Pipe                           │
│                     (ZodValidationPipe)                          │
│            Validates query params & request body                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Controller                               │
│                  @JsonApiType('rooms')                           │
│              @UseInterceptors(ResourceLinksInterceptor)          │
│                                                                   │
│    async findAll(@Query() pagination: PaginationQueryDto) {     │
│      return await this.roomsService.findAll(pagination);        │
│    }                                                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Service                                │
│                                                                   │
│    async findAll(pagination) {                                  │
│      const data = await db.query.rooms.findMany(...);          │
│      const total = await db.select({ count }).from(rooms);     │
│      return {                                                    │
│        data,                                                     │
│        meta: { total, page, limit, totalPages }                │
│      };                                                          │
│    }                                                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                Response Interceptor Chain                        │
│                   (Bottom to Top execution)                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ ZodSerializerInt...  │  │ JsonApiInterceptor   │
        │ Validates response   │  │ (Global)             │
        │ against schema       │  │                      │
        └──────────────────────┘  │ Wraps response in    │
                    │              │ JSON:API format:     │
                    │              │                      │
                    │              │ {                    │
                    └──────────────┤   jsonapi: {...}    │
                                   │   data: [...],       │
                                   │   meta: {...},       │
                                   │   links: {...}       │
                                   │ }                    │
                                   └──────────────────────┘
                                               │
                                               ▼
                                   ┌──────────────────────┐
                                   │ ResourceLinksInt...  │
                                   │ (Per-Controller)     │
                                   │                      │
                                   │ Adds custom links    │
                                   │ and relationships:   │
                                   │                      │
                                   │ data.links = {       │
                                   │   self, update,      │
                                   │   delete, book       │
                                   │ }                    │
                                   │                      │
                                   │ data.relationships   │
                                   │ = { ... }            │
                                   └──────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Response                               │
│                                                                   │
│  {                                                                │
│    "jsonapi": { "version": "1.1" },                             │
│    "data": [                                                      │
│      {                                                            │
│        "type": "rooms",                                          │
│        "id": "1",                                                │
│        "attributes": {                                           │
│          "name": "Conference Room A",                           │
│          "capacity": 10                                          │
│        },                                                         │
│        "links": {                                                │
│          "self": "http://localhost:3000/rooms/1",               │
│          "update": "http://localhost:3000/rooms/1",             │
│          "delete": "http://localhost:3000/rooms/1",             │
│          "book": "http://localhost:3000/rooms/1/book"           │
│        },                                                         │
│        "relationships": {                                        │
│          "building": {                                           │
│            "links": {                                            │
│              "self": "http://localhost:3000/buildings",         │
│              "related": "http://localhost:3000/buildings"       │
│            }                                                      │
│          }                                                        │
│        }                                                          │
│      }                                                            │
│    ],                                                             │
│    "meta": {                                                      │
│      "page": {                                                   │
│        "total": 50,                                             │
│        "size": 10,                                              │
│        "number": 1,                                             │
│        "totalPages": 5                                          │
│      }                                                            │
│    },                                                             │
│    "links": {                                                     │
│      "self": "http://localhost:3000/rooms?page=1&limit=10",     │
│      "first": "http://localhost:3000/rooms?page=1&limit=10",    │
│      "next": "http://localhost:3000/rooms?page=2&limit=10",     │
│      "last": "http://localhost:3000/rooms?page=5&limit=10"      │
│    }                                                              │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Error Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                             │
│                    POST /rooms (invalid data)                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Validation Pipe                           │
│                     (ZodValidationPipe)                          │
│                  ❌ Validation Failed                            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ throws BadRequestException
┌─────────────────────────────────────────────────────────────────┐
│                      Exception Filter Chain                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ HttpExceptionFilter  │  │ JsonApiErrorFilter   │
        │                      │  │                      │
        │ Logs the error       │  │ Formats error as     │
        │                      │  │ JSON:API:            │
        └──────────────────────┘  │                      │
                    │              │ {                    │
                    │              │   jsonapi: {...}    │
                    └──────────────┤   errors: [{        │
                                   │     status: "400",   │
                                   │     title: "...",    │
                                   │     detail: "...",   │
                                   │     source: {...}    │
                                   │   }],                │
                                   │   links: {...}       │
                                   │ }                    │
                                   └──────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Response (400)                         │
│                                                                   │
│  {                                                                │
│    "jsonapi": { "version": "1.1" },                             │
│    "errors": [                                                    │
│      {                                                            │
│        "status": "400",                                          │
│        "title": "Validation Error",                             │
│        "detail": "Name must be at least 3 characters",          │
│        "source": {                                               │
│          "pointer": "/data/attributes/name"                     │
│        }                                                          │
│      }                                                            │
│    ],                                                             │
│    "links": {                                                     │
│      "about": "http://localhost:3000/rooms"                      │
│    }                                                              │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                     Controllers                           │ │
│  │                                                            │ │
│  │  @JsonApiType('rooms')                                    │ │
│  │  @UseInterceptors(ResourceLinksInterceptor)              │ │
│  │  class RoomsController { ... }                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                      Services                             │ │
│  │                                                            │ │
│  │  class RoomsService {                                     │ │
│  │    async findAll(pagination) {                           │ │
│  │      // Business logic                                    │ │
│  │      return { data, meta };                              │ │
│  │    }                                                       │ │
│  │  }                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    JSON:API Transform Layer                     │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │             Global Interceptors (APP_INTERCEPTOR)         │ │
│  │                                                            │ │
│  │  1. ZodSerializerInterceptor                             │ │
│  │     ↓ Validates response schema                          │ │
│  │                                                            │ │
│  │  2. JsonApiInterceptor ⭐ MAIN TRANSFORMER                │ │
│  │     ↓ Wraps in JSON:API format                           │ │
│  │     ↓ Adds jsonapi, data, meta, links                    │ │
│  │                                                            │ │
│  │  3. ResourceLinksInterceptor (per-controller)            │ │
│  │     ↓ Adds custom HATEOAS links                          │ │
│  │     ↓ Adds relationships                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Global Filters (APP_FILTER)                  │ │
│  │                                                            │ │
│  │  1. HttpExceptionFilter                                   │ │
│  │     ↓ Logs errors                                         │ │
│  │                                                            │ │
│  │  2. JsonApiErrorFilter ⭐ ERROR FORMATTER                 │ │
│  │     ↓ Formats errors as JSON:API                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      Support Components                         │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Types (jsonapi.types.ts)                                       │
│  ├── JsonApiDocument                                            │
│  ├── JsonApiResource                                            │
│  ├── JsonApiError                                               │
│  ├── JsonApiLinks                                               │
│  └── JsonApiMeta                                                │
│                                                                  │
│  Decorators (jsonapi.decorator.ts)                              │
│  ├── @JsonApiType(type: string)                                │
│  └── @JsonApiSerialize(enabled: boolean)                        │
│                                                                  │
│  Services                                                        │
│  ├── PaginationService                                          │
│  └── ResourceLinksService                                       │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Data Transformation Flow

```
Service Output                    JsonApiInterceptor             ResourceLinksInterceptor
────────────────                  ──────────────────             ────────────────────────

{                                 {                              {
  data: [                           jsonapi: {                     jsonapi: { ... },
    {                                 version: "1.1"                data: [
      id: "1",                       },                               {
      name: "Room A",       ───►     data: [                           type: "rooms",
      capacity: 10                     {                               id: "1",
    }                                    type: "rooms",                attributes: {
  ],                                     id: "1",                        name: "Room A",
  meta: {                                attributes: {                  capacity: 10
    total: 50,                             name: "Room A",            },
    page: 1,                               capacity: 10     ───►       links: {  ⭐ Added
    limit: 10,                           }                               self: "...",
    totalPages: 5                      }                                update: "...",
  }                                  ],                                delete: "...",
}                                    meta: {                           book: "..."
                                       page: {                        },
                                         total: 50,                   relationships: {  ⭐ Added
                                         size: 10,                      building: {
                                         number: 1,                       links: { ... }
                                         totalPages: 5                  }
                                       }                              }
                                     },                             }
                                     links: {               →     ],
                                       self: "...",               meta: { ... },
                                       first: "...",              links: { ... }
                                       next: "...",             }
                                       last: "..."
                                     }
                                   }
```

## Key Design Decisions

### 1. **Interceptor-Based Architecture**
- ✅ Non-invasive - works with existing code
- ✅ Centralized transformation logic
- ✅ Easy to enable/disable
- ✅ Maintains separation of concerns

### 2. **Automatic Resource Type Inference**
- Primary: Use `@JsonApiType()` decorator
- Fallback: Infer from URL path (`/rooms` → `rooms`)
- Override: Specify per-endpoint if needed

### 3. **Flexible Link Generation**
- Declarative with `@ResourceLinks()` decorator
- Conditional links based on resource state
- Supports custom link logic with functions

### 4. **Pagination Strategy**
- Page-based pagination (`?page=1&limit=10`)
- Complete pagination links (first, prev, next, last, self)
- Meta includes total count and page info

### 5. **Error Handling**
- All errors formatted as JSON:API
- Validation errors include source pointers
- Consistent error structure across all endpoints

## Benefits of This Architecture

1. **Minimal Code Changes Required**
   - Add `@JsonApiType()` to controllers
   - Services mostly unchanged
   - Automatic wrapping handles the rest

2. **Standards Compliant**
   - Follows JSON:API v1.1 specification
   - Self-documenting API
   - Client libraries can consume easily

3. **Maintainable**
   - Clear separation of concerns
   - Centralized transformation logic
   - Easy to test and debug

4. **Extensible**
   - Add new decorators for features
   - Extend interceptors for custom logic
   - Type-safe with TypeScript

5. **Performance**
   - Efficient interceptor chain
   - Minimal overhead
   - No unnecessary transformations

6. **Developer Experience**
   - Automatic formatting
   - Type safety
   - Good error messages
   - Comprehensive documentation
