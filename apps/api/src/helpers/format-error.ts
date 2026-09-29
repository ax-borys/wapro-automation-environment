import { AllegroError } from '@wae/allegro';
import {
   BaseError,
   UpstreamError,
   AppError,
   ErrorCode,
   ValidationError,
} from '@wae/error';
import { WaproError } from '@wae/wapro';
import { GenericSchema } from 'valibot';

type Details =
   | AllegroError['details']
   | AppError['details']
   | UpstreamError['details']
   | WaproError['details']
   | ValidationError<GenericSchema>['details'];

export type FormattedError = {
   code: ErrorCode;
   message: string;
   source: BaseError['source'];
   provider?: UpstreamError['provider'];
   cause?: any;
   details?: Details;
};

export function formatError<
   T extends { details?: Details; cause?: any; message?: string },
>(error: T): FormattedError {
   if (error instanceof AppError) {
      return {
         code: error.code,
         message: error.message,
         source: error.source,
         cause: error.cause ? formatError(error.cause) : null,
         details: error.details,
      };
   } else if (error instanceof UpstreamError) {
      return {
         code: error.code,
         message: error.message,
         source: error.source,
         provider: error.provider,
         cause: error.cause ? formatError(error.cause) : null,
         details: error.details,
      };
   } else if (error instanceof ValidationError) {
      return {
         code: error.code,
         message: error.message,
         source: error.source,
         cause: error.cause ? formatError(error.cause) : null,
         details: error.details,
      };
   } else {
      return {
         code: 'INTERNAL',
         message: error.message ?? 'Something went wrong.',
         source: 'app',
         cause: null,
      };
   }
}
