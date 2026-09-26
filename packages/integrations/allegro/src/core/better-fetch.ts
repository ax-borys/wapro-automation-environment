import assert from 'assert';
import { GenericSchema, InferOutput } from 'valibot';
import { contractMismatch, errorOccured } from '../error/';
import * as v from 'valibot';
import { BaseError, statusToCode } from '@wae/error';

export async function fetchWithValidation<
   TSchema extends GenericSchema,
   TErrorSchema extends GenericSchema,
>(
   schema: TSchema,
   errorSchema: TErrorSchema,
   request: Request,
   generalErrorMessage?: string,
): Promise<InferOutput<TSchema>>;
export async function fetchWithValidation<
   TSchema extends GenericSchema,
   TErrorSchema extends GenericSchema,
>(
   schema: TSchema,
   errorSchema: TErrorSchema,
   url: string,
   options: RequestInit,
   generalErrorMessage?: string,
): Promise<InferOutput<TSchema>>;
export async function fetchWithValidation<
   TSchema extends GenericSchema,
   TErrorSchema extends GenericSchema,
>(
   schema: TSchema,
   errorSchema: TErrorSchema,
   requestOrUrl: Request | string,
   optionsOrGeneralErrorMessage?: RequestInit | string,
   possibleGeneralErrorMessage?: string,
): Promise<InferOutput<TSchema>> {
   let request: Request | null = null;
   let generalErrorMessage: unknown = null;

   if (requestOrUrl instanceof Request) {
      request = requestOrUrl.clone();
      generalErrorMessage = optionsOrGeneralErrorMessage;
   } else {
      assert(typeof optionsOrGeneralErrorMessage === 'object');

      request = new Request(requestOrUrl, optionsOrGeneralErrorMessage);
      generalErrorMessage = possibleGeneralErrorMessage;
   }

   assert(
      typeof request === 'object',
      'Assertion failed: request is not instanceof Request.',
   );
   assert(
      typeof generalErrorMessage === 'string',
      'Assertion failed: generalErrorMessage is not string',
   );

   try {
      const response = await fetch(request);

      if (!response.ok) {
         try {
            const rawErrorResult = await response.json();
            const parsedErrorResult = v.safeParse(errorSchema, rawErrorResult);

            if (parsedErrorResult.success) {
               throw errorOccured(
                  statusToCode(response.status),
                  'Fetching failed.',
                  undefined,
                  parsedErrorResult.output,
               );
            }

            throw contractMismatch(
               'Fetching failed. Obtaining error body failed due to schema mismatch. Probably allegro has changed its api recently.',
               parsedErrorResult.issues,
            );
         } catch (error) {
            if (error instanceof SyntaxError) {
               throw contractMismatch('Fetching failed. Body is not json.');
            }

            throw error;
         }
      }

      try {
         const rawResult = await response.json();
         const parsedResult = v.safeParse(schema, rawResult);

         if (!parsedResult.success) {
            throw contractMismatch(
               'Fetching succeeded, but obtaining body failed due to schema mismatch. Probably allegro has changed its api recently.',
            );
         }

         return parsedResult.output;
      } catch (error) {
         if (error instanceof SyntaxError) {
            throw contractMismatch(
               'Fetching succeed, but obtaining body failed, because its format is not JSON.',
            );
         }
         throw error;
      }
   } catch (error) {
      if (error instanceof BaseError) {
         throw errorOccured(
            'UNAVAILABLE',
            generalErrorMessage || 'Error occured during fetching.',
            error,
            error.details,
         );
      } else {
         throw errorOccured(
            'UNAVAILABLE',
            `Unexpected error. Raw error body: ${JSON.stringify(error, null, 2)}`,
         );
      }
   }
}
