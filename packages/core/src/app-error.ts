type ErrorCode =
   | 'NOT_FOUND'
   | 'VALIDATION'
   | 'UNPROCESSABLE'
   | 'CONFLICT'
   | 'FORBIDDEN'
   | 'UNAUTHORIZED';

const STATUS_MAP: Record<ErrorCode, number> = {
   NOT_FOUND: 404,
   VALIDATION: 400,
   UNPROCESSABLE: 422,
   CONFLICT: 409,
   FORBIDDEN: 403,
   UNAUTHORIZED: 401,
};

export class AppError extends Error {
   readonly code: ErrorCode;
   readonly status: number;

   constructor(code: ErrorCode, message: string) {
      super(message);
      this.code = code;
      this.status = STATUS_MAP[code];
   }
}

export const notFound = (msg = 'Not found') => new AppError('NOT_FOUND', msg);
export const conflict = (msg: string) => new AppError('CONFLICT', msg);
export const forbidden = (msg = 'Forbidden') => new AppError('FORBIDDEN', msg);
export const validationError = (msg: string) => new AppError('VALIDATION', msg);
export const businessRuleViolation = (msg: string) =>
   new AppError('UNPROCESSABLE', msg);
