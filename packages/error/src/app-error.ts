import { BaseError } from './base-error';
import { ErrorCode } from './error-code';

export class AppError extends BaseError {
   readonly source = 'app';
   readonly name = 'AppError';

   constructor(
      code: ErrorCode,
      message: string,
      cause?: BaseError,
      details?: unknown,
      options?: { retryable?: boolean; retryAfter?: number },
   ) {
      super(code, message, cause, details, options);
   }
}
