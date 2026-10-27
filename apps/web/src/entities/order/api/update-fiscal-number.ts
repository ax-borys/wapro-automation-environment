import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';

export type UpdateFiscalNumberInput = InferRequestType<
   (typeof client.receipt)['fiscal-number']['$put']
>;

export async function updateFiscalNumber(
   input: UpdateFiscalNumberInput['json'],
) {
   const response = await client.receipt['fiscal-number'].$put({ json: input });

   if (!response.ok) {
      const error = await response.json();
      throw error.error;
   }

   const result = await response.json();
   return result.data;
}
