import { AllegroError } from '@wae/allegro';
import {
   BaseError,
   UpstreamError,
   AppError,
   ErrorCode,
   ValidationError,
   AppErrorFormatted,
   UpstreamErrorFormatted,
   ValidationErrorFormatted,
} from '@wae/error';
import { WaproError } from '@wae/wapro';
import { GenericSchema } from 'valibot';

export type FormattedError =
   | AppErrorFormatted
   | AppErrorFormatted<{ originalMessage?: string; raw?: string }>
   | UpstreamErrorFormatted
   | UpstreamErrorFormatted<AllegroError['details']>
   | UpstreamErrorFormatted<WaproError['details']>
   | ValidationErrorFormatted<GenericSchema>;

export function formatError<
   T extends {
      details?: FormattedError['details'];
      cause?: any;
      message?: string;
   },
>(error: T): FormattedError {
   if (error instanceof AppError) {
      return error.format();
   } else if (error instanceof UpstreamError) {
      return error.format();
   } else if (error instanceof ValidationError) {
      return error.format();
   } else {
      return new AppError(
         'INTERNAL',
         error.message ?? 'Something went wrong',
         undefined,
         { originalMessage: error.message, raw: JSON.stringify(error) },
      ).format();
   }
}
