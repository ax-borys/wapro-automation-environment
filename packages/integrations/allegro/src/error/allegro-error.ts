import { BaseError, ErrorCode, UpstreamError } from '@wae/error';
import { GenericSchema, InferIssue } from 'valibot';

export class AllegroError<TDetails> extends UpstreamError {
   constructor(
      code: ErrorCode,
      message: string,
      cause?: BaseError,
      details?: TDetails,
   ) {
      super(code, 'allegro', message, cause, details);
   }
}

export const contractMismatch = <TSchema extends GenericSchema>(
   msg: string,
   issues?: InferIssue<TSchema>[],
) =>
   new AllegroError(
      'UNAVAILABLE',
      msg,
      undefined,
      issues ? { issues } : undefined,
   );
