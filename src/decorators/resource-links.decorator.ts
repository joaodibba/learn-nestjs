import { SetMetadata } from '@nestjs/common';

export interface LinkDefinition {
  name: string;
  href: string | ((resource: any, request: any) => string | null);
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  title?: string;
  description?: string;
  condition?: (resource: any, request: any) => boolean;
}

export interface RelationshipDefinition {
  name: string;
  resourceType: string;
  href: string | ((resource: any, request: any) => string);
  condition?: (resource: any, request: any) => boolean;
}

export const RESOURCE_LINKS_KEY = 'resource_links';
export const RESOURCE_RELATIONSHIPS_KEY = 'resource_relationships';

/**
 * Decorator to define resource links for a controller method
 */
export const ResourceLinks = (links: LinkDefinition[]) =>
  SetMetadata(RESOURCE_LINKS_KEY, links);

/**
 * Decorator to define resource relationships for a controller method
 */
export const ResourceRelationships = (
  relationships: RelationshipDefinition[],
) => SetMetadata(RESOURCE_RELATIONSHIPS_KEY, relationships);

/**
 * Helper function to create a self link
 */
export const selfLink = (resourceType?: string): LinkDefinition => ({
  name: 'self',
  href: (resource: any, request: any) => {
    const baseUrl = getBaseUrl(request);
    const type = resourceType || resource.type || 'resource';
    return `${baseUrl}/${type}/${resource.id}`;
  },
  method: 'GET',
  title: 'Self',
});

/**
 * Helper function to create an update link
 */
export const updateLink = (resourceType?: string): LinkDefinition => ({
  name: 'update',
  href: (resource: any, request: any) => {
    const baseUrl = getBaseUrl(request);
    const type = resourceType || resource.type || 'resource';
    return `${baseUrl}/${type}/${resource.id}`;
  },
  method: 'PATCH',
  title: 'Update',
});

/**
 * Helper function to create a delete link
 */
export const deleteLink = (resourceType?: string): LinkDefinition => ({
  name: 'delete',
  href: (resource: any, request: any) => {
    const baseUrl = getBaseUrl(request);
    const type = resourceType || resource.type || 'resource';
    return `${baseUrl}/${type}/${resource.id}`;
  },
  method: 'DELETE',
  title: 'Delete',
});

/**
 * Helper function to create a related resource link
 */
export const relatedLink = (
  name: string,
  resourceType: string,
  condition?: (resource: any, request: any) => boolean,
): LinkDefinition => ({
  name,
  href: (resource: any, request: any) => {
    const baseUrl = getBaseUrl(request);
    return `${baseUrl}/${resourceType}`;
  },
  method: 'GET',
  title: `Related ${resourceType}`,
  condition,
});

/**
 * Helper function to create a nested resource link
 */
export const nestedLink = (
  name: string,
  nestedPath: string | ((resource: any) => string),
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  condition?: (resource: any, request: any) => boolean,
): LinkDefinition => ({
  name,
  href: (resource: any, request: any) => {
    const baseUrl = getBaseUrl(request);
    const path =
      typeof nestedPath === 'function' ? nestedPath(resource) : nestedPath;
    return `${baseUrl}/${resource.type}/${resource.id}/${path}`;
  },
  method,
  title: name.charAt(0).toUpperCase() + name.slice(1),
  condition,
});

/**
 * Helper function to create a relationship
 */
export const relationship = (
  name: string,
  resourceType: string,
  href?: string | ((resource: any, request: any) => string),
  condition?: (resource: any, request: any) => boolean,
): RelationshipDefinition => ({
  name,
  resourceType,
  href:
    href ||
    ((resource: any, request: any) => {
      const baseUrl = getBaseUrl(request);
      return `${baseUrl}/${resourceType}`;
    }),
  condition,
});

/**
 * Helper function to get base URL from request
 */
function getBaseUrl(request: any): string {
  const protocol = request.protocol || 'http';
  const host = request.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}
