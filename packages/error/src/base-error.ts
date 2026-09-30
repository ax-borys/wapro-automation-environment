import { StatusCode } from 'hono/utils/http-status';
import { ErrorCode } from './error-code';
import { codeToStatus } from './utils';

export abstract class BaseError extends Error {
   abstract readonly source: 'app' | 'upstream';
   abstract readonly name: string;

   readonly code: ErrorCode;
   readonly cause?: Error;
   readonly details?: unknown;

   retryable?: boolean;
   retryAfter?: number;

   constructor(
      code: ErrorCode,
      message: string,
      cause?: BaseError['cause'],
      details?: unknown,
      options?: { retryable?: boolean; retryAfter?: number },
   ) {
      super(message);
      this.code = code;
      this.cause = cause;
      this.details = details;
      this.retryable = options?.retryable;
      this.retryAfter = options?.retryAfter;
   }

   get status(): StatusCode {
      return codeToStatus(this.code);
   }

   public toString(): string {
      return `${this.name}(${this.code}): ${
         this.message
      } - caused by ${this.cause?.toString()}`;
   }

   abstract format(): Record<string, any>;
}
