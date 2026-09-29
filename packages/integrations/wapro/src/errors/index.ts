import { BaseError, UpstreamError, ErrorCode } from '@wae/error';

export class WaproError<TDetails = unknown> extends UpstreamError {
   constructor(
      code: ErrorCode,
      message: string,
      cause?: BaseError,
      details?: TDetails,
   ) {
      super(code, 'wapro', message, cause, details);
   }
}

export const errorOccured = <TDetails>(
   code: ErrorCode,
   message: string,
   cause?: BaseError,
   details?: TDetails,
) => new WaproError<TDetails>(code, message, cause, details);
