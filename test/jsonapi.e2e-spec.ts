import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JsonApiExampleController } from '../src/examples/jsonapi-example.controller';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JsonApiInterceptor } from '../src/interceptors/jsonapi.interceptor';
import { JsonApiErrorFilter } from '../src/filters/jsonapi-error.filter';
import { ResourceLinksInterceptor } from '../src/interceptors/resource-links.interceptor';
import { Reflector } from '@nestjs/core';

describe('JSON:API Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [JsonApiExampleController],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: JsonApiInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: JsonApiErrorFilter,
        },
        Reflector,
        ResourceLinksInterceptor,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /examples', () => {
    it('should return JSON:API formatted paginated response', () => {
      return request(app.getHttpServer())
        .get('/examples')
        .expect(200)
        .expect((res) => {
          // Check JSON:API structure
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body.jsonapi).toEqual({ version: '1.1' });

          // Check data array
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);

          // Check first resource structure
          if (res.body.data.length > 0) {
            const resource = res.body.data[0];
            expect(resource).toHaveProperty('type', 'examples');
            expect(resource).toHaveProperty('id');
            expect(resource).toHaveProperty('attributes');
          }

          // Check pagination meta
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta.page).toHaveProperty('total');
          expect(res.body.meta.page).toHaveProperty('number');
          expect(res.body.meta.page).toHaveProperty('size');

          // Check pagination links
          expect(res.body).toHaveProperty('links');
          expect(res.body.links).toHaveProperty('self');
        });
    });

    it('should support pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/examples?page=2&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page.number).toBe('2'); // Query params are strings
          expect(res.body.meta.page.size).toBe(5);
          expect(res.body.links.self).toContain('page=2');
          expect(res.body.links.self).toContain('limit=5');
        });
    });
  });

  describe('GET /examples/:id', () => {
    it('should return JSON:API formatted single resource', () => {
      return request(app.getHttpServer())
        .get('/examples/1')
        .expect(200)
        .expect((res) => {
          // Check JSON:API structure
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body.jsonapi).toEqual({ version: '1.1' });

          // Check single resource structure
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('type', 'examples');
          expect(res.body.data).toHaveProperty('id', '1');
          expect(res.body.data).toHaveProperty('attributes');

          // Check attributes
          const attrs = res.body.data.attributes;
          expect(attrs).toHaveProperty('name');
          expect(attrs).toHaveProperty('description');
          expect(attrs).toHaveProperty('status');

          // Check links
          expect(res.body.data).toHaveProperty('links');
          expect(res.body.data.links).toHaveProperty('self');
          expect(res.body.data.links).toHaveProperty('update');
          expect(res.body.data.links).toHaveProperty('delete');

          // Check relationships
          expect(res.body.data).toHaveProperty('relationships');
          expect(res.body.data.relationships).toHaveProperty('author');
          expect(res.body.data.relationships).toHaveProperty('category');
        });
    });

    it('should include conditional links based on resource state', () => {
      return request(app.getHttpServer())
        .get('/examples/1')
        .expect(200)
        .expect((res) => {
          const links = res.body.data.links;
          
          // Example 1 is inactive, should have activate link
          if (res.body.data.attributes.status === 'inactive') {
            expect(links).toHaveProperty('activate');
            expect(links).not.toHaveProperty('deactivate');
          } else {
            expect(links).toHaveProperty('deactivate');
            expect(links).not.toHaveProperty('activate');
          }
        });
    });
  });

  describe('POST /examples', () => {
    it('should create a resource and return JSON:API formatted response', () => {
      return request(app.getHttpServer())
        .post('/examples')
        .send({
          data: {
            type: 'examples',
            attributes: {
              name: 'New Example',
              description: 'Test example',
            },
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('type', 'examples');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.attributes.name).toBe('New Example');
        });
    });

    it('should accept plain JSON body (not JSON:API wrapped)', () => {
      return request(app.getHttpServer())
        .post('/examples')
        .send({
          name: 'Simple Example',
          description: 'Without JSON:API wrapping',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body.data.attributes.name).toBe('Simple Example');
        });
    });
  });

  describe('PATCH /examples/:id', () => {
    it('should update a resource and return JSON:API formatted response', () => {
      return request(app.getHttpServer())
        .patch('/examples/1')
        .send({
          data: {
            type: 'examples',
            id: '1',
            attributes: {
              name: 'Updated Example',
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body.data.attributes.name).toBe('Updated Example');
        });
    });
  });

  describe('DELETE /examples/:id', () => {
    it('should delete a resource and return JSON:API formatted response', () => {
      return request(app.getHttpServer())
        .delete('/examples/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body).toHaveProperty('data', null);
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta.deleted).toBe(true);
        });
    });
  });

  describe('Nested Resources', () => {
    it('should return nested resource collection with proper type', () => {
      return request(app.getHttpServer())
        .get('/examples/1/comments')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body.data).toBeInstanceOf(Array);
          
          if (res.body.data.length > 0) {
            expect(res.body.data[0].type).toBe('comments');
          }
        });
    });
  });

  describe('Custom Actions', () => {
    it('should execute custom action and return formatted response', () => {
      return request(app.getHttpServer())
        .post('/examples/1/activate')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('jsonapi');
          expect(res.body.data.attributes.status).toBe('active');
          expect(res.body.data.links).toHaveProperty('deactivate');
        });
    });
  });
});
