import { BaseError, UpstreamError, AppError, ErrorCode } from '@wae/error';

export type FormattedError = {
   code: ErrorCode;
   message: string;
   source: BaseError['source'];
   provider?: UpstreamError['provider'];
   cause?: any;
   details?: unknown;
};

export function formatError(
   error:
      | BaseError
      | AppError
      | UpstreamError
      | (Error & { details?: unknown }),
): FormattedError {
   if (
      error instanceof BaseError ||
      error instanceof AppError ||
      error instanceof UpstreamError
   ) {
      const formattedError: Partial<FormattedError> = {
         code: error.code,
         message: error.message,
         source: error.source,
      };

      if (error instanceof UpstreamError && error.provider) {
         formattedError.provider = error.provider;
      }

      if (
         error.cause instanceof BaseError ||
         error.cause instanceof AppError ||
         error.cause instanceof UpstreamError
      ) {
         formattedError.cause = formatError(error.cause);
      } else {
         formattedError.cause = {
            code: error.code,
            message: error.message,
            cause: error.cause,
            details: error.details,
         };
      }

      if (error.details) {
         formattedError.details = error.details;
      }

      return formattedError as FormattedError;
   }

   return {
      code: 'INTERNAL',
      message: error.message,
      source: 'app',
      cause: error,
      details: error.details,
   };
}
