import {
   GenericSchema,
   GenericSchemaAsync,
   InferIssue,
   ValiError,
} from 'valibot';
import { BaseError } from './base-error';

export class ValidationError<
   TSchema extends GenericSchema | GenericSchemaAsync,
> extends BaseError {
   readonly source = 'app';
   readonly name = 'ValidationError';
   readonly details?: { issues: InferIssue<TSchema>[] };

   constructor(
      message: string,
      cause?: ValiError<TSchema>,
      details?: ValidationError<TSchema>['details'],
   ) {
      super('VALIDATION', message, cause, details);
      this.details = details;
   }
}
