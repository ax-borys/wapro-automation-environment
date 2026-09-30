import { BaseError } from './base-error';
import { ErrorCode } from './error-code';

export class ApiError<
   TDetails extends Record<string, any> | undefined = undefined,
> extends BaseError {
   readonly source: 'app' | 'upstream';
   readonly provider?: 'allegro' | 'wapro';
   readonly name = 'ApiError';
   readonly details?: TDetails;

   constructor(
      code: ErrorCode,
      message: string,
      source: 'app' | 'upstream',
      provider?: 'wapro' | 'allegro',
      cause?: BaseError['cause'],
      details?: TDetails,
      options?: { retryable?: boolean; retryAfter?: number },
   ) {
      super(code, message, cause, details, options);
      this.details = details;
      this.source = source;
      this.provider = provider;
   }

   format() {
      return {
         code: this.code,
         message: this.message,
         source: this.source,
         ...(this.provider ? { provider: this.provider } : {}),
         ...(this.cause ? { cause: this.cause } : {}),
         ...(this.details ? { details: this.details } : {}),
      };
   }
}

export type ApiErrorFormatted<
   TDetails extends Record<string, any> | undefined = undefined,
> = ReturnType<ApiError<TDetails>['format']>;
