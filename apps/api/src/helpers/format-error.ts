import {
   BaseError,
   UpstreamError,
   AppError,
   ErrorCode,
   ValidationError,
} from '@wae/error';

export type FormattedError<TDetails = unknown> = {
   code: ErrorCode;
   message: string;
   source: BaseError['source'];
   provider?: UpstreamError['provider'];
   cause?: any;
   details?: TDetails;
};

export function formatError<
   T extends { details?: unknown; cause?: any; message?: string },
>(error: T): FormattedError<T['details']> {
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
         details: null,
      };
   }
}

export function formatErrorOld(
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
