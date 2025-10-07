export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationLinks {
  self: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
}

export interface ResourceLinks {
  self: string;
  update: string;
  delete: string;
}

export interface ResourceItem<T> {
  type: string;
  id: string;
  attributes: T;
  links: ResourceLinks;
}

export interface PaginatedResponse<T> {
  links: PaginationLinks;
  data: ResourceItem<T>[];
  meta: PaginationMeta;
}

export interface SingleResourceResponse<T> {
  data: ResourceItem<T>;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
