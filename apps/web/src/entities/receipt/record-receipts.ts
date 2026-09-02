import { client } from '@/lib/client';
import { CreateReceiptInput, CreateReceiptOutput } from '@wae/receipt';
import { ApiResponse } from '@wae/types';

export async function recordReceipts(receiptsData: CreateReceiptInput[]) {
   const response = await client.receipt.record.$post({
      json: receiptsData.map((i) => ({
         ...i,
         createdAt: i.createdAt.toISOString(),
      })),
   });

   if (!response.ok) {
      const result = await response.json();
      throw result.error;
   }

   const result = await response.json();
   return result.data;
}
