import { BaseError } from './base-error';
import { ErrorCode } from './error-code';

export class UpstreamError extends BaseError {
   readonly source = 'upstream';
   readonly name = 'UpstreamError';
   readonly provider: 'allegro' | 'wapro';

   constructor(
      code: ErrorCode,
      provider: UpstreamError['provider'],
      message: string,
      cause?: BaseError,
      details?: unknown,
      options?: { retryable?: boolean; retryAfter: number },
   ) {
      super(code, message, cause, details, options);
      this.provider = provider;
   }
}
