import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationQuery } from '../types/pagination.types';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQuery => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    
    return {
      page: Math.max(1, page),
      limit: Math.min(Math.max(1, limit), 100), // Cap at 100 items per page
    };
  },
);
