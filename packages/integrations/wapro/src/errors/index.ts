import { BaseError, UpstreamError, ErrorCode } from '@wae/error';

export class WaproError<
   TDetails extends Record<string, any> | undefined = undefined,
> extends UpstreamError<TDetails> {
   constructor(
      code: ErrorCode,
      message: string,
      cause?: UpstreamError['cause'],
      details?: TDetails,
   ) {
      super(code, 'wapro', message, cause, details);
   }
}

export const errorOccured = (
   code: ErrorCode,
   message: string,
   cause?: WaproError['cause'],
   details?: WaproError['details'],
) => new WaproError(code, message, cause, details);
