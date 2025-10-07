import { Injectable } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { ResourceLinks, ResourceItem } from '../types/pagination.types';

@Injectable()
export class ResourceLinksService {
  constructor(private readonly requestContextService: RequestContextService) {}

  generateResourceLinks(resourceId: string, resourceType: string): ResourceLinks {
    // Use relative URLs for better portability
    const resourcePath = `/${resourceType}s/${resourceId}`;

    return {
      self: resourcePath,
      update: resourcePath,
      delete: resourcePath,
    };
  }

  transformToResourceItem<T>(
    item: T & { id: string },
    resourceType: string,
  ): ResourceItem<T> {
    const { id, ...attributes } = item;
    
    return {
      type: resourceType,
      id,
      attributes: attributes as T,
      links: this.generateResourceLinks(id, resourceType),
    };
  }

  transformToResourceItems<T>(
    items: (T & { id: string })[],
    resourceType: string,
  ): ResourceItem<T>[] {
    return items.map(item => this.transformToResourceItem(item, resourceType));
  }
}
