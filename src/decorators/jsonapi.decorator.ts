import { SetMetadata } from '@nestjs/common';

export const JSONAPI_TYPE_KEY = 'jsonapi:type';
export const JSONAPI_SERIALIZE_KEY = 'jsonapi:serialize';

/**
 * Decorator to specify the resource type for JSON:API serialization
 * @param type The resource type (e.g., 'articles', 'users', 'rooms')
 */
export const JsonApiType = (type: string) =>
  SetMetadata(JSONAPI_TYPE_KEY, type);

/**
 * Decorator to enable/disable JSON:API serialization for a specific endpoint
 * @param enabled Whether to serialize as JSON:API (default: true)
 */
export const JsonApiSerialize = (enabled: boolean = true) =>
  SetMetadata(JSONAPI_SERIALIZE_KEY, enabled);
