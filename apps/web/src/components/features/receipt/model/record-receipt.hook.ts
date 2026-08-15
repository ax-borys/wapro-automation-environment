import { GenerateReceiptInput } from '@wae/receipt';

export function useRecordReceipts() {
   const recordReceipts = async (receiptsData: GenerateReceiptInput[]) => {
      const response = await fetch('http://localhost:8082/record-receipts', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ receipts: receiptsData }),
      });

      if (!response.ok) {
         return;
      }
      return response.json();
   };

   return recordReceipts;
}
