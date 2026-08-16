import { GenerateReceiptInput } from '@wae/receipt';
import { ApiResponse } from '@wae/types';

export function useRecordReceipts() {
   const recordReceipts = async (receiptsData: GenerateReceiptInput[]) => {
      const response = await fetch('http://localhost:8082/record-receipts', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(receiptsData),
      });

      return (await response.json()) as ApiResponse<{
         receiptNumbers: string[];
      }>;
   };

   return recordReceipts;
}
