import { BaseError, ErrorCode, UpstreamError } from '@wae/error';
import { GenericSchema, InferIssue } from 'valibot';

export class AllegroError<
   TSchema extends GenericSchema = GenericSchema,
   TDetails extends {
      originalStatus?: number;
      originalMessage?: string;
      issues?: InferIssue<TSchema>[];
      raw?: string;
   } = {
      originalStatus: number;
      originalMessage?: string;
      issues?: InferIssue<TSchema>[];
      raw?: string;
   },
> extends UpstreamError<TDetails> {
   constructor(
      code: ErrorCode,
      message: string,
      cause?: UpstreamError<TDetails>['cause'],
      details?: TDetails,
   ) {
      super(code, 'allegro', message, cause, details);
   }
}

export const contractMismatch = <TSchema extends GenericSchema>(
   msg: string,
   details?: AllegroError['details'],
) => new AllegroError<TSchema>('UNAVAILABLE', msg, undefined, details);

export const errorOccured = <TDetails>(
   code: ErrorCode,
   msg: string,
   cause?: AllegroError['cause'],
   details?: AllegroError['details'],
) => new AllegroError(code, msg, cause, details);
