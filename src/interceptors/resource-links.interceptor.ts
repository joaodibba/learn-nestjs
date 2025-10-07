import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RESOURCE_LINKS_KEY,
  RESOURCE_RELATIONSHIPS_KEY,
  LinkDefinition,
  RelationshipDefinition,
} from '../decorators/resource-links.decorator';
import { ResourceItem, ResourceLinks } from '../types/link.types';

@Injectable()
export class ResourceLinksInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const links = this.reflector.getAllAndOverride<LinkDefinition[]>(
      RESOURCE_LINKS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const relationships = this.reflector.getAllAndOverride<
      RelationshipDefinition[]
    >(RESOURCE_RELATIONSHIPS_KEY, [context.getHandler(), context.getClass()]);

    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        // Handle JSON:API formatted responses (from JsonApiInterceptor)
        if (data.jsonapi && data.jsonapi.version === '1.1') {
          if (data.data) {
            if (Array.isArray(data.data)) {
              data.data = data.data.map((item: any) =>
                this.addLinksAndRelationships(item, links, relationships, request),
              );
            } else if (typeof data.data === 'object' && data.data !== null) {
              data.data = this.addLinksAndRelationships(
                data.data,
                links,
                relationships,
                request,
              );
            }
          }
          return data;
        }

        // Handle paginated responses (before JSON:API transformation)
        if (data.data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map((item: any) =>
              this.transformResourceItem(item, links, relationships, request),
            ),
          };
        }

        // Handle single resource responses (before JSON:API transformation)
        if (data.data && !Array.isArray(data.data)) {
          return {
            ...data,
            data: this.transformResourceItem(
              data.data,
              links,
              relationships,
              request,
            ),
          };
        }

        // Handle direct resource responses (before JSON:API transformation)
        if (data.type && data.id) {
          return this.transformResourceItem(
            data,
            links,
            relationships,
            request,
          );
        }

        return data;
      }),
    );
  }

  private addLinksAndRelationships(
    item: any,
    links?: LinkDefinition[],
    relationships?: RelationshipDefinition[],
    request?: any,
  ): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // Only add if it's a JSON:API resource
    if (item.type && item.id) {
      const newLinks = this.generateLinks(item, links, request);
      
      if (Object.keys(newLinks).length > 0) {
        item.links = { ...item.links, ...newLinks };
      }

      if (relationships && relationships.length > 0) {
        const newRelationships = this.generateRelationships(item, relationships, request);
        if (newRelationships && Object.keys(newRelationships).length > 0) {
          item.relationships = { ...item.relationships, ...newRelationships };
        }
      }
    }

    return item;
  }

  private transformResourceItem(
    item: any,
    links?: LinkDefinition[],
    relationships?: RelationshipDefinition[],
    request?: any,
  ): ResourceItem<any> {
    const resourceItem: ResourceItem<any> = {
      type: item.type || this.inferResourceType(item),
      id: item.id,
      attributes: this.extractAttributes(item),
      links: this.generateLinks(item, links, request),
    };

    // Add relationships if defined
    if (relationships && relationships.length > 0) {
      resourceItem.relationships = this.generateRelationships(
        item,
        relationships,
        request,
      );
    }

    return resourceItem;
  }

  private generateLinks(
    resource: any,
    linkDefinitions?: LinkDefinition[],
    request?: any,
  ): ResourceLinks {
    const links: ResourceLinks = {};

    if (!linkDefinitions || !request) {
      return links;
    }

    for (const linkDef of linkDefinitions) {
      // Check condition if provided
      if (linkDef.condition && !linkDef.condition(resource, request)) {
        continue;
      }

      // Generate href
      const href =
        typeof linkDef.href === 'function'
          ? linkDef.href(resource, request)
          : linkDef.href;

      // Skip if href is null
      if (href === null) {
        continue;
      }

      // Create link object
      if (linkDef.method || linkDef.title || linkDef.description) {
        links[linkDef.name] = {
          href,
          ...(linkDef.method && { method: linkDef.method }),
          ...(linkDef.title && { title: linkDef.title }),
          ...(linkDef.description && { description: linkDef.description }),
        };
      } else {
        links[linkDef.name] = href;
      }
    }

    return links;
  }

  private generateRelationships(
    resource: any,
    relationshipDefinitions: RelationshipDefinition[],
    request: any,
  ): any {
    const relationships: any = {};

    for (const relDef of relationshipDefinitions) {
      // Check condition if provided
      if (relDef.condition && !relDef.condition(resource, request)) {
        continue;
      }

      const href =
        typeof relDef.href === 'function'
          ? relDef.href(resource, request)
          : relDef.href;

      relationships[relDef.name] = {
        links: {
          self: href,
          related: href,
        },
        // You can add data here if you have related resource data
        // data: resource[relDef.name] || null,
      };
    }

    return relationships;
  }

  private inferResourceType(item: any): string {
    // Try to infer resource type from constructor name or other properties
    if (item.constructor && item.constructor.name) {
      return item.constructor.name.toLowerCase().replace(/dto$/, '');
    }

    // Try to infer from table name or other properties
    if (item.tableName) {
      return item.tableName;
    }

    // Fallback to a generic type
    return 'resource';
  }

  private extractAttributes(item: any): any {
    const { type, id, links, relationships, ...attributes } = item;
    return attributes;
  }
}
