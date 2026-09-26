import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';
import { useError } from '../error';

export type RecordReceiptInput = InferRequestType<
   typeof client.receipt.record.$post
>;

export async function recordReceipts(input: RecordReceiptInput['json']) {
   const response = await client.receipt.record.$post({ json: input });

   if (!response.ok) {
      const error = await response.json();
      throw error.error;
   }

   const result = await response.json();
   return result.data;
}
