import { BaseError } from './base-error';
import { ErrorCode } from './error-code';

export class AppError<
   TDetails extends Record<string, any> | undefined = undefined,
> extends BaseError {
   readonly source = 'app';
   readonly name = 'AppError';
   readonly details?: TDetails;

   constructor(
      code: ErrorCode,
      message: string,
      cause?: BaseError,
      details?: TDetails,
      options?: { retryable?: boolean; retryAfter?: number },
   ) {
      super(code, message, cause, details, options);
      this.details = details;
   }

   format() {
      return {
         code: this.code,
         message: this.message,
         source: this.source,
         cause: this.cause,
         details: this.details,
      };
   }
}

export type AppErrorFormatted<
   TDetails extends Record<string, any> | undefined = undefined,
> = ReturnType<AppError<TDetails>['format']>;
