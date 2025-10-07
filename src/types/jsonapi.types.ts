/**
 * JSON:API v1.1 Type Definitions
 * Based on https://jsonapi.org/format/1.1/
 */

/**
 * A link MUST be represented as either:
 * - a string containing the link's URL
 * - a link object
 */
export interface JsonApiLink {
  href: string;
  rel?: string;
  describedby?: JsonApiLink;
  title?: string;
  type?: string;
  hreflang?: string | string[];
  meta?: JsonApiMeta;
}

export type JsonApiLinkValue = string | JsonApiLink;

/**
 * Links object
 */
export interface JsonApiLinks {
  self?: JsonApiLinkValue;
  related?: JsonApiLinkValue;
  describedby?: JsonApiLinkValue;
  first?: JsonApiLinkValue;
  last?: JsonApiLinkValue;
  prev?: JsonApiLinkValue;
  next?: JsonApiLinkValue;
  [key: string]: JsonApiLinkValue | undefined;
}

/**
 * Meta object - can contain any non-standard meta-information
 */
export interface JsonApiMeta {
  [key: string]: any;
}

/**
 * Resource identifier object
 */
export interface JsonApiResourceIdentifier {
  type: string;
  id: string;
  meta?: JsonApiMeta;
}

/**
 * Relationship object
 */
export interface JsonApiRelationship {
  links?: JsonApiLinks;
  data?: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null;
  meta?: JsonApiMeta;
}

/**
 * Relationships object
 */
export interface JsonApiRelationships {
  [key: string]: JsonApiRelationship;
}

/**
 * Resource object
 */
export interface JsonApiResource {
  type: string;
  id: string;
  attributes?: {
    [key: string]: any;
  };
  relationships?: JsonApiRelationships;
  links?: JsonApiLinks;
  meta?: JsonApiMeta;
}

/**
 * Error source object
 */
export interface JsonApiErrorSource {
  pointer?: string;
  parameter?: string;
  header?: string;
}

/**
 * Error object
 */
export interface JsonApiError {
  id?: string;
  links?: {
    about?: JsonApiLinkValue;
    type?: JsonApiLinkValue;
  };
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: JsonApiErrorSource;
  meta?: JsonApiMeta;
}

/**
 * JSON:API Document structure
 */
export interface JsonApiDocument {
  data?: JsonApiResource | JsonApiResource[] | null;
  errors?: JsonApiError[];
  meta?: JsonApiMeta;
  jsonapi?: {
    version: string;
    meta?: JsonApiMeta;
  };
  links?: JsonApiLinks;
  included?: JsonApiResource[];
}

/**
 * Pagination meta structure
 */
export interface JsonApiPaginationMeta {
  page: {
    total: number;
    size: number;
    number: number;
    totalPages: number;
  };
}
