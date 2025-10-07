import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  JsonApiDocument,
  JsonApiResource,
  JsonApiLinks,
  JsonApiMeta,
  JsonApiPaginationMeta,
} from '../types/jsonapi.types';

export const JSONAPI_TYPE_KEY = 'jsonapi:type';
export const JSONAPI_SERIALIZE_KEY = 'jsonapi:serialize';

/**
 * JSON:API v1.1 compliant response interceptor
 * Automatically wraps all responses according to the JSON:API specification
 */
@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if this endpoint should be serialized as JSON:API
    const shouldSerialize = this.reflector.getAllAndOverride<boolean>(
      JSONAPI_SERIALIZE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Default to true unless explicitly disabled
    if (shouldSerialize === false) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (!data) {
          return this.createJsonApiDocument(null, request, response);
        }

        return this.transformToJsonApi(data, context, request, response);
      }),
    );
  }

  private transformToJsonApi(
    data: any,
    context: ExecutionContext,
    request: any,
    response: any,
  ): JsonApiDocument {
    // Get resource type from decorator or infer it
    const resourceType =
      this.reflector.getAllAndOverride<string>(JSONAPI_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || this.inferResourceType(request, data);

    // Handle paginated responses
    if (this.isPaginatedResponse(data)) {
      return this.transformPaginatedResponse(data, resourceType, request);
    }

    // Handle wrapped single resource { data: resource }
    if (data.data && !Array.isArray(data.data)) {
      const resource = this.transformToResource(data.data, resourceType);
      return this.createJsonApiDocument(resource, request, response, data.meta);
    }

    // Handle wrapped array response { data: [...] }
    if (data.data && Array.isArray(data.data)) {
      const resources = data.data.map((item: any) =>
        this.transformToResource(item, resourceType),
      );
      return this.createJsonApiDocument(
        resources,
        request,
        response,
        data.meta,
      );
    }

    // Handle direct resource response
    if (this.isResource(data)) {
      const resource = this.transformToResource(data, resourceType);
      return this.createJsonApiDocument(resource, request, response);
    }

    // Handle array of resources
    if (Array.isArray(data)) {
      const resources = data.map((item: any) =>
        this.transformToResource(item, resourceType),
      );
      return this.createJsonApiDocument(resources, request, response);
    }

    // Fallback: wrap as-is
    return this.createJsonApiDocument(data, request, response);
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data &&
      data.meta &&
      ('page' in data.meta || 'total' in data.meta)
    );
  }

  private isResource(data: any): boolean {
    return data && typeof data === 'object' && 'id' in data;
  }

  private transformToResource(
    item: any,
    resourceType: string,
  ): JsonApiResource {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // If already a JSON:API resource, return as-is
    if (item.type && item.id && item.attributes !== undefined) {
      return item;
    }

    const { id, type, links, relationships, meta, ...attributes } = item;

    const resource: JsonApiResource = {
      type: type || resourceType,
      id: String(id),
    };

    // Only add attributes if there are any (excluding id, type, links, relationships, meta)
    if (Object.keys(attributes).length > 0) {
      resource.attributes = attributes;
    }

    // Add links if present
    if (links) {
      resource.links = links;
    }

    // Add relationships if present
    if (relationships) {
      resource.relationships = relationships;
    }

    // Add meta if present
    if (meta) {
      resource.meta = meta;
    }

    return resource;
  }

  private transformPaginatedResponse(
    data: any,
    resourceType: string,
    request: any,
  ): JsonApiDocument {
    const resources = Array.isArray(data.data)
      ? data.data.map((item: any) =>
          this.transformToResource(item, resourceType),
        )
      : [];

    const document: JsonApiDocument = {
      data: resources,
      jsonapi: {
        version: '1.1',
      },
    };

    // Add pagination meta
    if (data.meta) {
      const meta = data.meta;
      const paginationMeta: JsonApiPaginationMeta = {
        page: {
          total: meta.total || 0,
          size: meta.limit || 10,
          number: meta.page || 1,
          totalPages:
            meta.totalPages ||
            Math.ceil((meta.total || 0) / (meta.limit || 10)),
        },
      };
      document.meta = paginationMeta;
    }

    // Add pagination links
    if (data.links) {
      document.links = data.links;
    } else if (data.meta) {
      document.links = this.generatePaginationLinks(data.meta, request);
    }

    return document;
  }

  private generatePaginationLinks(meta: any, request: any): JsonApiLinks {
    const { page, limit, totalPages } = meta;
    const baseUrl = this.getBaseUrl(request);
    const path = request.path || request.url.split('?')[0];

    const buildUrl = (pageNum: number) => {
      const url = new URL(`${baseUrl}${path}`);
      url.searchParams.set('page', String(pageNum));
      url.searchParams.set('limit', String(limit || 10));
      return url.toString();
    };

    const links: JsonApiLinks = {
      self: buildUrl(page || 1),
    };

    if (totalPages > 1) {
      links.first = buildUrl(1);
      links.last = buildUrl(totalPages);
    }

    if (page < totalPages) {
      links.next = buildUrl(page + 1);
    }

    if (page > 1) {
      links.prev = buildUrl(page - 1);
    }

    return links;
  }

  private createJsonApiDocument(
    data: any,
    request: any,
    response: any,
    meta?: JsonApiMeta,
  ): JsonApiDocument {
    const document: JsonApiDocument = {
      jsonapi: {
        version: '1.1',
      },
      data: data,
    };

    // Add meta if provided
    if (meta) {
      document.meta = meta;
    }

    // Add self link
    const selfLink = this.getSelfLink(request);
    if (selfLink) {
      document.links = {
        self: selfLink,
      };
    }

    return document;
  }

  private inferResourceType(request: any, data?: any): string {
    // Try to get from URL path
    const path = request.path || request.url;
    const segments = path.split('/').filter((s: string) => s);

    if (segments.length > 0) {
      // Get the first segment as resource type
      return segments[0];
    }

    // Try to infer from data
    if (data && data.type) {
      return data.type;
    }

    // Fallback
    return 'resources';
  }

  private getBaseUrl(request: any): string {
    const protocol = request.protocol || 'http';
    const host = request.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
  }

  private getSelfLink(request: any): string {
    const baseUrl = this.getBaseUrl(request);
    const originalUrl = request.originalUrl || request.url;
    return `${baseUrl}${originalUrl}`;
  }
}
