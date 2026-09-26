import { ContentfulStatusCode, StatusCode } from 'hono/utils/http-status';
import { ErrorCode } from './error-code';

export function codeToStatus(code: ErrorCode): ContentfulStatusCode {
   switch (code) {
      case 'VALIDATION':
         return 400;
      case 'UNAUTHORIZED':
         return 402;
      case 'FORBIDDEN':
         return 403;
      case 'NOT_FOUND':
         return 404;
      case 'CONFLICT':
         return 409;
      case 'INVALID_REFERENCE':
         return 422;
      case 'UNPROCESSABLE':
         return 422;
      case 'RATE_LIMITED':
         return 429;
      case 'INTERNAL':
         return 500;
      case 'UNAVAILABLE':
         return 502;
      default:
         return 500;
   }
}

export function statusToCode(status: number): ErrorCode {
   switch (status) {
      case 400:
         return 'VALIDATION';
      case 402:
         return 'UNAUTHORIZED';
      case 403:
         return 'FORBIDDEN';
      case 404:
         return 'NOT_FOUND';
      case 409:
         return 'CONFLICT';
      case 422:
         return 'UNPROCESSABLE';
      case 429:
         return 'RATE_LIMITED';
      case 500:
         return 'INTERNAL';
      case 502:
         return 'UNAVAILABLE';
      default:
         return 'INTERNAL';
   }
}
