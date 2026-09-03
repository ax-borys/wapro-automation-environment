import { client } from '@/lib/client';
import { CreateReceiptInput, CreateReceiptOutput } from '@wae/receipt';
import { ApiResponse } from '@wae/types';
import { InferRequestType } from 'hono/client';

type RecordReceiptInput = InferRequestType<typeof client.receipt.record.$post>;

export async function recordReceipts(input: RecordReceiptInput['json']) {
   const response = await client.receipt.record.$post({ json: input });

   if (!response.ok) {
      const result = await response.json();
      throw result.error;
   }

   const result = await response.json();
   return result.data;
}
