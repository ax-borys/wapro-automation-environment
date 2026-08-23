import { GetReceiptOutput, GetReceiptsInput } from '@wae/receipt';
import { ApiResponse } from '@wae/types';

export async function fetchReceipts(input?: GetReceiptsInput) {
   const result = await fetch('http://localhost:8082/get-receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'applications/json' },
      body: JSON.stringify(input ? input : {}),
   });

   return (await result.json()) as ApiResponse<GetReceiptOutput[]>;
}
