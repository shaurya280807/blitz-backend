import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StandardResponse<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        // If the response already has the paginated shape, pass through as-is
        // but ensure meta has a timestamp (it doesn't in paginated responses,
        // they have total/page/limit/totalPages)
        if (value && typeof value === 'object' && 'data' in value && 'meta' in value) {
          return value;
        }

        // Wrap plain responses
        return {
          data: value,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
