import { client } from '@/lib/client';
import { GetReceiptOutput, GetReceiptsInput } from '@wae/receipt';
import { ApiResponse } from '@wae/types';

export async function fetchReceipts(input?: GetReceiptsInput) {
   const response = await client.receipt.$post({ json: { ...input } });

   if (!response.ok) {
      const result = await response.json();
      throw result.error;
   }

   const result = await response.json();

   return result.data;
}
