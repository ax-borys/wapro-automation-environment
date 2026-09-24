export type ErrorCode =
   | 'NOT_FOUND'
   | 'VALIDATION'
   | 'RESOURCE_MISSING'
   | 'UNPROCESSABLE'
   | 'CONFLICT'
   | 'FORBIDDEN'
   | 'AUTHENTICATION'
   | 'UNAUTHORIZED'
   | 'EXTERNAL_API_ERROR';

type Scope = 'APPLICATION' | 'ALLEGRO' | 'WAPRO';

const STATUS_MAP = {
   NOT_FOUND: 404,
   VALIDATION: 400,
   RESOURCE_MISSING: 400,
   UNPROCESSABLE: 422,
   CONFLICT: 409,
   FORBIDDEN: 403,
   AUTHENTICATION: 401,
   UNAUTHORIZED: 401,
   EXTERNAL_API_ERROR: 502,
} as const satisfies Record<ErrorCode, number>;

export type HandledStatusCodes = (typeof STATUS_MAP)[keyof typeof STATUS_MAP];

export class AppError extends Error {
   readonly code: ErrorCode;
   readonly status: number;
   readonly details: unknown;
   readonly scope: Scope;

   constructor(
      code: ErrorCode,
      message: string,
      scope?: Scope,
      cause?: Error | AppError | unknown,
      details?: unknown,
   ) {
      super(message);
      this.code = code;
      this.cause = cause;
      this.details = details;
      this.status = STATUS_MAP[code];
      this.scope = scope ?? 'APPLICATION';
   }
}

export const notFound = (msg = 'Not found') => new AppError('NOT_FOUND', msg);
export const conflict = (msg: string) => new AppError('CONFLICT', msg);
export const forbidden = (msg = 'Forbidden') => new AppError('FORBIDDEN', msg);
export const validationError = (
   msg: string,
   scope?: Scope,
   cause?: unknown,
   details?: unknown,
) => new AppError('VALIDATION', msg, scope, cause, details);

export const businessRuleViolation = (
   msg: string,
   scope?: Scope,
   cause?: unknown,
   details?: unknown,
) => new AppError('UNPROCESSABLE', msg, scope, cause, details);
export const resourceMissing = (
   msg: string,
   scope?: Scope,
   cause?: unknown,
   details?: unknown,
) => new AppError('RESOURCE_MISSING', msg, scope, cause, details);
export const externalApiError = (
   msg: string,
   code?: ErrorCode,
   scope?: Scope,
   cause?: unknown,
   details?: unknown,
) => new AppError(code ?? 'EXTERNAL_API_ERROR', msg, scope, cause, details);
