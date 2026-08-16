import React, { createContext, Provider, useContext, useState } from 'react';
import { useRecordReceipts } from './record-receipt.hook';

const receiptContext = createContext<
   {
      orderId: string;
      status: 'RECORD' | 'RECORDING' | 'RECORDED';
   }[]
>([]);

const recordReceiptContext = createContext<Record<
   string,
   ReturnType<typeof useRecordReceipts>
> | null>(null);

export function ReceiptProvider({
   children,
}: React.ComponentProps<typeof recordReceiptContext.Provider>) {
   const [receipts, setReceipts] = useState<
      {
         orderId: string;
         status: 'RECORD' | 'RECORDING' | 'RECORDED';
      }[]
   >([]);

   const [receiptRecorders, setReceiptRecorders] = useState<Record<
      string,
      ReturnType<typeof useRecordReceipts>
   > | null>(null);

   return (
      <receiptContext.Provider value={[]}>
         <recordReceiptContext.Provider value={null}>
            {children}
         </recordReceiptContext.Provider>
      </receiptContext.Provider>
   );
}

export function useReceipt(orderId: string) {
   const receipts = useContext(receiptContext);
   const recordReceiptFetch = useContext(recordReceiptContext)?.[orderId];

   return [receipts.map((r) => r.orderId === orderId), recordReceiptFetch];
}

export function useSetReceipt(orderId: string) {
   const receipts = useContext(receiptContext);
   const recordReceiptFetch = useContext(recordReceiptContext)?.[orderId];

   return [receipts.map((r) => r.orderId === orderId), recordReceiptFetch];
}
