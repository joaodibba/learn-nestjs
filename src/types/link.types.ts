export interface LinkConfig {
  href: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  title?: string;
  description?: string;
  condition?: (resource: any, request: any) => boolean;
}

export interface ResourceLinks {
  [key: string]: string | LinkConfig;
}

export interface ResourceItem<T> {
  type: string;
  id: string;
  attributes: T;
  links: ResourceLinks;
  relationships?: {
    [key: string]: {
      links: {
        self: string;
        related: string;
      };
      data?: any;
    };
  };
}

export interface PaginatedResponse<T> {
  links: {
    self: string;
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
  data: ResourceItem<T>[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
