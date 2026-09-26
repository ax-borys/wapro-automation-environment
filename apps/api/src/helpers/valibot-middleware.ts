import { Hook, vValidator } from '@hono/valibot-validator';
import { ValidationError } from '@wae/error';
import { Env } from 'hono';
import { GenericSchema, GenericSchemaAsync, ValiError } from 'valibot';

function valibotHook<T extends GenericSchema | GenericSchemaAsync>(): Hook<
   T,
   Env,
   string,
   'json',
   void
> {
   return async (result) => {
      if (!result.success) {
         throw new ValidationError(
            'Validation failed.',
            new ValiError(result.issues),
            {
               issues: result.issues,
            },
         );
      }
   };
}

export const valibotJsonMiddleware = <
   T extends GenericSchema | GenericSchemaAsync,
>(
   schema: T,
) => vValidator('json', schema, valibotHook<T>());

export { valibotHook };
