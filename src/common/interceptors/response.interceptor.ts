import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  status: boolean;
  message: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((response) => {
        // If response is already formatted, return as is
        if (response?.status !== undefined) {
          return response;
        }

        // Handle responses with only a message
        if (typeof response === 'string' || response?.message) {
          return {
            status: true,
            message: response.message || response,
            data: response.data || undefined,
          };
        }

        // Default response format
        return {
          status: true,
          message: 'Success',
          data: response,
        };
      }),
    );
  }
}
