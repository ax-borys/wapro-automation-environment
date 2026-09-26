import * as v from 'valibot';

export const ErrorCodes = [
   'FORBIDDEN',
   'UNAUTHORIZED',
   'INTERNAL',
   'CONFLICT',
   'NOT_FOUND',
   'VALIDATION',
   'INVALID_REFERENCE',
   'UNPROCESSABLE',
   'RATE_LIMITED',
   'UNAVAILABLE',
] as const;

export const ErrorCodeEnum = v.picklist(ErrorCodes);

export type ErrorCode = v.InferOutput<typeof ErrorCodeEnum>;
