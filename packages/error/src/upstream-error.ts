import { BaseError } from './base-error';
import { ErrorCode } from './error-code';

export class UpstreamError<
   TDetails extends Record<string, any> | undefined = undefined,
> extends BaseError {
   readonly source = 'upstream';
   readonly name = 'UpstreamError';
   readonly provider: 'allegro' | 'wapro';
   readonly details?: TDetails;

   constructor(
      code: ErrorCode,
      provider: UpstreamError['provider'],
      message: string,
      cause?: BaseError['cause'],
      details?: TDetails,
      options?: { retryable?: boolean; retryAfter: number },
   ) {
      super(code, message, cause, details, options);
      this.provider = provider;
      this.details = details;
   }

   format() {
      return {
         code: this.code,
         message: this.message,
         source: this.source,
         provider: this.provider,
         cause: this.cause,
         details: this.details,
      };
   }
}

export type UpstreamErrorFormatted<
   TDetails extends Record<string, any> | undefined = undefined,
> = ReturnType<UpstreamError<TDetails>['format']>;
