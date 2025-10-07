import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { ResourceLinksInterceptor } from '../interceptors/resource-links.interceptor';
import { JsonApiType } from '../decorators/jsonapi.decorator';
import {
  ResourceLinks,
  ResourceRelationships,
  selfLink,
  updateLink,
  deleteLink,
  nestedLink,
  relationship,
} from '../decorators/resource-links.decorator';

/**
 * Example controller demonstrating JSON:API v1.1 features
 *
 * This example shows:
 * - Automatic JSON:API formatting
 * - Pagination with proper links
 * - Resource relationships
 * - Conditional HATEOAS links
 * - Custom resource links
 */
@ApiTags('examples')
@Controller('examples')
@UseInterceptors(ResourceLinksInterceptor)
@JsonApiType('examples')
export class JsonApiExampleController {
  /**
   * GET /examples
   *
   * Example paginated collection with JSON:API format
   *
   * Response format:
   * {
   *   "jsonapi": { "version": "1.1" },
   *   "data": [...],
   *   "meta": { "page": {...} },
   *   "links": { "self": "...", "first": "...", "next": "..." }
   * }
   */
  @Get()
  @ApiOperation({
    summary: 'Get paginated examples with full JSON:API formatting',
  })
  @ResourceLinks([
    selfLink('examples'),
    {
      name: 'create',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/examples`;
      },
      method: 'POST',
      title: 'Create Example',
    },
  ])
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const pageNum = page || 1;
    const pageSize = limit || 10;

    // Simulate paginated data
    const total = 100;
    const data = Array.from({ length: pageSize }, (_, i) => ({
      id: String((pageNum - 1) * pageSize + i + 1),
      name: `Example ${(pageNum - 1) * pageSize + i + 1}`,
      description: `This is example item ${(pageNum - 1) * pageSize + i + 1}`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      createdAt: new Date().toISOString(),
    }));

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: pageNum < Math.ceil(total / pageSize),
        hasPrev: pageNum > 1,
      },
    };
  }

  /**
   * GET /examples/:id
   *
   * Example single resource with relationships and conditional links
   *
   * Response format:
   * {
   *   "jsonapi": { "version": "1.1" },
   *   "data": {
   *     "type": "examples",
   *     "id": "1",
   *     "attributes": {...},
   *     "links": {...},
   *     "relationships": {...}
   *   },
   *   "links": { "self": "..." }
   * }
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get single example with relationships and conditional links',
  })
  @ResourceLinks([
    selfLink('examples'),
    updateLink('examples'),
    deleteLink('examples'),
    // Conditional link - only show for active examples
    {
      name: 'activate',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/examples/${resource.id}/activate`;
      },
      method: 'POST',
      title: 'Activate',
      description: 'Activate this example',
      condition: (resource) => resource.status === 'inactive',
    },
    // Conditional link - only show for inactive examples
    {
      name: 'deactivate',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/examples/${resource.id}/deactivate`;
      },
      method: 'POST',
      title: 'Deactivate',
      description: 'Deactivate this example',
      condition: (resource) => resource.status === 'active',
    },
    // Nested resource links
    nestedLink('comments', 'comments'),
    nestedLink('attachments', 'attachments'),
    // Custom action link
    {
      name: 'export',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/examples/${resource.id}/export`;
      },
      method: 'GET',
      title: 'Export',
      description: 'Export this example as JSON',
    },
  ])
  @ResourceRelationships([
    relationship('author', 'users'),
    relationship('category', 'categories'),
    relationship('tags', 'tags'),
  ])
  async findOne(@Param('id') id: string) {
    // Simulate fetching a single resource
    return {
      id,
      name: `Example ${id}`,
      description: `This is a detailed description of example ${id}`,
      status: parseInt(id) % 2 === 0 ? 'active' : 'inactive',
      authorId: '123',
      categoryId: '456',
      tagIds: ['1', '2', '3'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * POST /examples
   *
   * Create a new example resource
   *
   * Request body (JSON:API format recommended but not required):
   * {
   *   "data": {
   *     "type": "examples",
   *     "attributes": {
   *       "name": "New Example",
   *       "description": "Description"
   *     }
   *   }
   * }
   *
   * Response: JSON:API formatted resource
   */
  @Post()
  @ApiOperation({ summary: 'Create a new example' })
  @ResourceLinks([
    selfLink('examples'),
    updateLink('examples'),
    deleteLink('examples'),
  ])
  @ResourceRelationships([
    relationship('author', 'users'),
    relationship('category', 'categories'),
  ])
  async create(@Body() body: any) {
    // Extract data from JSON:API format or use direct attributes
    const attributes = body.data?.attributes || body;

    // Simulate creating a resource
    const newResource = {
      id: String(Date.now()),
      name: attributes.name || 'Untitled',
      description: attributes.description || '',
      status: 'active',
      authorId: '123',
      categoryId: attributes.categoryId || '456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { data: newResource };
  }

  /**
   * PATCH /examples/:id
   *
   * Update an existing example resource
   *
   * Request body (JSON:API format recommended but not required):
   * {
   *   "data": {
   *     "type": "examples",
   *     "id": "1",
   *     "attributes": {
   *       "name": "Updated Name"
   *     }
   *   }
   * }
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an example' })
  @ResourceLinks([
    selfLink('examples'),
    updateLink('examples'),
    deleteLink('examples'),
  ])
  @ResourceRelationships([
    relationship('author', 'users'),
    relationship('category', 'categories'),
  ])
  async update(@Param('id') id: string, @Body() body: any) {
    // Extract data from JSON:API format or use direct attributes
    const attributes = body.data?.attributes || body;

    // Simulate updating a resource
    const updatedResource = {
      id,
      name: attributes.name || `Example ${id}`,
      description: attributes.description || `Description for ${id}`,
      status: attributes.status || 'active',
      authorId: '123',
      categoryId: attributes.categoryId || '456',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { data: updatedResource };
  }

  /**
   * DELETE /examples/:id
   *
   * Delete an example resource
   *
   * Response format (success):
   * {
   *   "jsonapi": { "version": "1.1" },
   *   "data": null,
   *   "meta": { "deleted": true }
   * }
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an example' })
  async remove(@Param('id') id: string) {
    // Return null data for successful deletion
    return {
      data: null,
      meta: {
        deleted: true,
        deletedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /examples/:id/comments
   *
   * Example nested resource collection
   */
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for an example' })
  @JsonApiType('comments')
  @ResourceLinks([
    {
      name: 'example',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        // Extract example ID from the request path
        const matches = request.path.match(/\/examples\/([^/]+)\//);
        const exampleId = matches ? matches[1] : '';
        return `${baseUrl}/examples/${exampleId}`;
      },
      method: 'GET',
      title: 'Parent Example',
    },
  ])
  async getComments(@Param('id') exampleId: string) {
    // Simulate nested resource collection
    const comments = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      exampleId,
      text: `This is comment ${i + 1} on example ${exampleId}`,
      authorId: String(100 + i),
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    return { data: comments };
  }

  /**
   * POST /examples/:id/activate
   *
   * Example custom action endpoint
   */
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate an example' })
  @ResourceLinks([
    selfLink('examples'),
    {
      name: 'deactivate',
      href: (resource, request) => {
        const baseUrl = request.protocol + '://' + request.get('host');
        return `${baseUrl}/examples/${resource.id}/deactivate`;
      },
      method: 'POST',
      title: 'Deactivate',
    },
  ])
  async activate(@Param('id') id: string) {
    const activatedResource = {
      id,
      name: `Example ${id}`,
      description: `Example ${id} has been activated`,
      status: 'active',
      activatedAt: new Date().toISOString(),
    };

    return { data: activatedResource };
  }
}
