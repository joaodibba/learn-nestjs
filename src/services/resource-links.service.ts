import { Injectable } from '@nestjs/common';
import { ResourceLinks, ResourceItem } from '../types/pagination.types';

@Injectable()
export class ResourceLinksService {
  generateResourceLinks(
    resourceId: string,
    resourceType: string,
    request?: any,
  ): ResourceLinks {
    // Use relative URLs for better portability
    const resourcePath = `/${resourceType}/${resourceId}`;

    return {
      self: resourcePath,
      update: resourcePath,
      delete: resourcePath,
    };
  }

  transformToResourceItem<T>(
    item: T & { id: string },
    resourceType: string,
    request?: any,
  ): ResourceItem<T> {
    const { id, ...attributes } = item;

    return {
      type: resourceType,
      id,
      attributes: attributes as T,
      links: this.generateResourceLinks(id, resourceType, request),
    };
  }

  transformToResourceItems<T>(
    items: (T & { id: string })[],
    resourceType: string,
    request?: any,
  ): ResourceItem<T>[] {
    return items.map((item) =>
      this.transformToResourceItem(item, resourceType, request),
    );
  }
}
