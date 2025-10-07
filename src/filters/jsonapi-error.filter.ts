import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonApiError, JsonApiDocument } from '../types/jsonapi.types';

/**
 * JSON:API v1.1 compliant error filter
 * Formats all errors according to the JSON:API error specification
 */
@Catch()
export class JsonApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: JsonApiError[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        errors = this.transformHttpExceptionToJsonApiErrors(
          exceptionResponse,
          status,
        );
      } else {
        errors = [
          {
            status: String(status),
            title: exception.message,
            detail: String(exceptionResponse),
          },
        ];
      }
    } else if (exception instanceof Error) {
      errors = [
        {
          status: String(status),
          title: 'Internal Server Error',
          detail: exception.message,
        },
      ];
    } else {
      errors = [
        {
          status: String(status),
          title: 'Unknown Error',
          detail: 'An unknown error occurred',
        },
      ];
    }

    const errorDocument: JsonApiDocument = {
      jsonapi: {
        version: '1.1',
      },
      errors,
      links: {
        about: this.getSelfLink(request),
      },
    };

    response.status(status).json(errorDocument);
  }

  private transformHttpExceptionToJsonApiErrors(
    exceptionResponse: any,
    status: number,
  ): JsonApiError[] {
    const errors: JsonApiError[] = [];

    // Handle validation errors (array of errors)
    if (Array.isArray(exceptionResponse.message)) {
      exceptionResponse.message.forEach((msg: any) => {
        if (typeof msg === 'string') {
          errors.push({
            status: String(status),
            title: exceptionResponse.error || 'Validation Error',
            detail: msg,
          });
        } else if (typeof msg === 'object') {
          errors.push({
            status: String(status),
            title: msg.title || exceptionResponse.error || 'Validation Error',
            detail: msg.detail || msg.message || JSON.stringify(msg),
            source:
              msg.source ||
              (msg.property
                ? { pointer: `/data/attributes/${msg.property}` }
                : undefined),
          });
        }
      });
    } else {
      // Single error
      errors.push({
        status: String(status),
        title: exceptionResponse.error || 'Error',
        detail: exceptionResponse.message || 'An error occurred',
        source: exceptionResponse.source,
      });
    }

    return errors;
  }

  private getSelfLink(request: any): string {
    const protocol = request.protocol || 'http';
    const host = request.get('host') || 'localhost:3000';
    const originalUrl = request.originalUrl || request.url;
    return `${protocol}://${host}${originalUrl}`;
  }
}
