import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { JsonApiInterceptor } from './jsonapi.interceptor';
import { JsonApiDocument } from '../types/jsonapi.types';

describe('JsonApiInterceptor', () => {
  let interceptor: JsonApiInterceptor;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JsonApiInterceptor,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<JsonApiInterceptor>(JsonApiInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (path: string = '/rooms'): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          protocol: 'http',
          get: (header: string) => (header === 'host' ? 'localhost:3000' : null),
          path,
          url: path,
          originalUrl: path,
        }),
        getResponse: () => ({
          statusCode: 200,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  const createMockCallHandler = (data: any): CallHandler => ({
    handle: () => of(data),
  });

  describe('Basic transformations', () => {
    it('should wrap single resource in JSON:API format', (done) => {
      const context = createMockExecutionContext('/rooms/1');
      const handler = createMockCallHandler({
        data: { id: '1', name: 'Room A', capacity: 10 },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('rooms');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        expect(result.jsonapi).toEqual({ version: '1.1' });
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(false);
        
        const resource = result.data as any;
        expect(resource.type).toBe('rooms');
        expect(resource.id).toBe('1');
        expect(resource.attributes).toEqual({ name: 'Room A', capacity: 10 });
        expect(result.links?.self).toBe('http://localhost:3000/rooms/1');
        
        done();
      });
    });

    it('should wrap array of resources in JSON:API format', (done) => {
      const context = createMockExecutionContext('/rooms');
      const handler = createMockCallHandler({
        data: [
          { id: '1', name: 'Room A' },
          { id: '2', name: 'Room B' },
        ],
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('rooms');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        expect(result.jsonapi).toEqual({ version: '1.1' });
        expect(Array.isArray(result.data)).toBe(true);
        
        const resources = result.data as any[];
        expect(resources).toHaveLength(2);
        expect(resources[0].type).toBe('rooms');
        expect(resources[0].id).toBe('1');
        expect(resources[0].attributes).toEqual({ name: 'Room A' });
        
        done();
      });
    });

    it('should handle null data', (done) => {
      const context = createMockExecutionContext('/rooms/999');
      const handler = createMockCallHandler(null);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('rooms');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        expect(result.jsonapi).toEqual({ version: '1.1' });
        expect(result.data).toBeNull();
        
        done();
      });
    });
  });

  describe('Pagination', () => {
    it('should transform paginated response with meta and links', (done) => {
      const context = createMockExecutionContext('/rooms');
      const handler = createMockCallHandler({
        data: [
          { id: '1', name: 'Room A' },
          { id: '2', name: 'Room B' },
        ],
        meta: {
          total: 50,
          page: 2,
          limit: 10,
          totalPages: 5,
          hasNext: true,
          hasPrev: true,
        },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('rooms');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        expect(result.jsonapi).toEqual({ version: '1.1' });
        expect(Array.isArray(result.data)).toBe(true);
        
        // Check meta
        expect(result.meta).toBeDefined();
        expect(result.meta).toHaveProperty('page');
        const pageMeta = (result.meta as any).page;
        expect(pageMeta.total).toBe(50);
        expect(pageMeta.size).toBe(10);
        expect(pageMeta.number).toBe(2);
        expect(pageMeta.totalPages).toBe(5);
        
        // Check links
        expect(result.links).toBeDefined();
        expect(result.links?.self).toContain('page=2');
        expect(result.links?.first).toContain('page=1');
        expect(result.links?.prev).toContain('page=1');
        expect(result.links?.next).toContain('page=3');
        expect(result.links?.last).toContain('page=5');
        
        done();
      });
    });
  });

  describe('Resource type inference', () => {
    it('should infer resource type from URL path', (done) => {
      const context = createMockExecutionContext('/employees/1');
      const handler = createMockCallHandler({
        data: { id: '1', name: 'John Doe' },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        const resource = result.data as any;
        expect(resource.type).toBe('employees');
        
        done();
      });
    });

    it('should use explicit resource type from decorator', (done) => {
      const context = createMockExecutionContext('/rooms/1');
      const handler = createMockCallHandler({
        data: { id: '1', name: 'Room A' },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('custom-type');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        const resource = result.data as any;
        expect(resource.type).toBe('custom-type');
        
        done();
      });
    });
  });

  describe('Serialization control', () => {
    it('should skip serialization when disabled', (done) => {
      const context = createMockExecutionContext('/health');
      const rawData = { status: 'ok', uptime: 12345 };
      const handler = createMockCallHandler(rawData);

      // Mock the reflector to return false for JSONAPI_SERIALIZE_KEY
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      interceptor.intercept(context, handler).subscribe((result) => {
        // Should return the raw data without JSON:API wrapping
        expect(result).toEqual(rawData);
        expect(result).not.toHaveProperty('jsonapi');
        
        done();
      });
    });
  });

  describe('Links', () => {
    it('should include self link', (done) => {
      const context = createMockExecutionContext('/rooms/1');
      const handler = createMockCallHandler({
        data: { id: '1', name: 'Room A' },
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('rooms');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        expect(result.links).toBeDefined();
        expect(result.links?.self).toBe('http://localhost:3000/rooms/1');
        
        done();
      });
    });
  });

  describe('Already formatted resources', () => {
    it('should preserve already formatted JSON:API resources', (done) => {
      const context = createMockExecutionContext('/rooms/1');
      const alreadyFormatted = {
        type: 'rooms',
        id: '1',
        attributes: { name: 'Room A' },
        links: { self: '/rooms/1' },
      };
      const handler = createMockCallHandler({ data: alreadyFormatted });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('rooms');

      interceptor.intercept(context, handler).subscribe((result: JsonApiDocument) => {
        const resource = result.data as any;
        expect(resource.type).toBe('rooms');
        expect(resource.id).toBe('1');
        expect(resource.attributes).toEqual({ name: 'Room A' });
        expect(resource.links).toEqual({ self: '/rooms/1' });
        
        done();
      });
    });
  });
});
