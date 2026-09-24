import { ErrorCode, externalApiError } from '@wae/core';

export const waproError = (
   msg: string,
   code?: ErrorCode,
   cause?: unknown,
   details?: unknown,
) =>
   externalApiError(msg, code ?? 'EXTERNAL_API_ERROR', 'WAPRO', cause, details);
