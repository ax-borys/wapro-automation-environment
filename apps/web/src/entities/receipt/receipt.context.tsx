'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Receipt = {
   orderId: string;
   status: 'RECORD' | 'RECORDING' | 'RECORDED';
   selected?: boolean;
};

export type ReceiptsSetter<T> = React.Dispatch<React.SetStateAction<T>>;

const receiptsContext = createContext<Receipt[]>([]);
const setReceiptsContext = createContext<ReceiptsSetter<Receipt[]> | null>(
   null,
);

export function ReceiptProvider({ chilrden }: { chilrden: ReactNode }) {
   const [receipts, setReceipts] = useState<Receipt[]>([]);

   return (
      <receiptsContext.Provider value={receipts}>
         <setReceiptsContext.Provider value={setReceipts}>
            {chilrden}
         </setReceiptsContext.Provider>
      </receiptsContext.Provider>
   );
}

export const useReceipt: (
   orderId: string,
) => [Receipt, (receipt: Receipt) => void] = (orderId: string) => {
   const receipts = useContext(receiptsContext);
   const setReceipts = useContext(setReceiptsContext);

   if (!setReceipts) {
      throw new Error('Component must be inside ReceiptProvider');
   }

   const receipt = receipts.find((r) => r.orderId === orderId) as Receipt;

   const setReceipt = (receipt: Receipt) => {
      setReceipts([...receipts.filter((r) => r.orderId !== orderId), receipt]);
   };

   return [receipt, setReceipt];
};

export const useSetReceipts = () => {
   const setReceipts = useContext(setReceiptsContext);
   return (receipts: Receipt[]) => setReceipts?.(receipts);
};

export const useReceipts = () => {
   const receipts = useContext(receiptsContext);
   return receipts;
};
