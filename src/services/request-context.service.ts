import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  getRequest() {
    return this.request;
  }

  getBaseUrl(): string {
    const protocol = this.request.protocol || 'http';
    const host = this.request.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
  }

  getCurrentPath(): string {
    const originalUrl = this.request.originalUrl || this.request.url;
    return originalUrl.split('?')[0]; // Remove query parameters
  }

  getFullBaseUrl(): string {
    return `${this.getBaseUrl()}${this.getCurrentPath()}`;
  }
}
