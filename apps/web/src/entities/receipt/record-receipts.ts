import { CreateReceiptInput, CreateReceiptOutput } from '@wae/receipt';
import { ApiResponse } from '@wae/types';

export async function recordReceipts(receiptsData: CreateReceiptInput[]) {
   const response = await fetch('http://localhost:8082/record-receipts', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptsData),
   });

   return (await response.json()) as ApiResponse<CreateReceiptOutput[]>;
}
