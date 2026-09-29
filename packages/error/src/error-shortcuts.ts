import { AppError } from './app-error';
import { BaseError } from './base-error';

export const businessRuleViolation = (
   msg: string,
   cause?: BaseError,
   details?: AppError['details'],
) => new AppError('UNPROCESSABLE', msg, cause, details);

export const invalidReference = (
   msg: string,
   cause?: BaseError,
   details?: AppError['details'],
) => new AppError('INVALID_REFERENCE', msg, cause, details);
