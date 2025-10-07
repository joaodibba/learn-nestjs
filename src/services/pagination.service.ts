import { Injectable } from '@nestjs/common';
import {
  PaginationMeta,
  PaginationLinks,
  PaginationQuery,
} from '../types/pagination.types';

@Injectable()
export class PaginationService {
  generateMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  generateLinks(
    meta: PaginationMeta,
    request: any,
    additionalParams: Record<string, string> = {},
  ): PaginationLinks {
    const { page, totalPages } = meta;
    const params = new URLSearchParams(additionalParams);

    // Get current path from request
    const originalUrl = request.originalUrl || request.url;
    const currentPath = originalUrl.split('?')[0]; // Remove query parameters

    const buildUrl = (pageNum: number) => {
      const urlParams = new URLSearchParams(params);
      urlParams.set('page', pageNum.toString());
      urlParams.set('limit', meta.limit.toString());
      return `${currentPath}?${urlParams.toString()}`;
    };

    const links: PaginationLinks = {
      self: buildUrl(page),
    };

    if (totalPages > 1) {
      links.first = buildUrl(1);
      links.last = buildUrl(totalPages);
    }

    if (meta.hasNext) {
      links.next = buildUrl(page + 1);
    }

    if (meta.hasPrev) {
      links.prev = buildUrl(page - 1);
    }

    return links;
  }
}
