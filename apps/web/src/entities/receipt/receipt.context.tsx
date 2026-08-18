'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Receipt = {
   orderId: string;
   status: 'RECORD' | 'RECORDING' | 'RECORDED';
   selected?: boolean;
   number?: string | null;
};

export type ReceiptsSetter<T> = React.Dispatch<React.SetStateAction<T>>;

const receiptsContext = createContext<Receipt[]>([]);
const setReceiptsContext = createContext<ReceiptsSetter<Receipt[]> | null>(
   null,
);

export function ReceiptProvider({ children }: { children: ReactNode }) {
   const [receipts, setReceipts] = useState<Receipt[]>([]);
   return (
      <receiptsContext.Provider value={receipts}>
         <setReceiptsContext.Provider value={setReceipts}>
            {children}
         </setReceiptsContext.Provider>
      </receiptsContext.Provider>
   );
}

export const useReceipt: (
   orderId: string,
) => [Receipt, (receipt: Receipt | ((prev: Receipt) => Receipt)) => void] = (
   orderId: string,
) => {
   const receipts = useContext(receiptsContext);
   const setReceipts = useContext(setReceiptsContext);

   if (!setReceipts) {
      throw new Error('Component must be inside ReceiptProvider');
   }

   const receipt = receipts.find((r) => r.orderId === orderId) as Receipt;

   const setReceipt = (updater: Receipt | ((prev: Receipt) => Receipt)) => {
      setReceipts((prev) =>
         prev.map((r) =>
            r.orderId === receipt.orderId
               ? typeof updater === 'function'
                  ? (updater as (prev: Receipt) => Receipt)(r)
                  : updater
               : r,
         ),
      );
   };

   return [receipt, setReceipt] as const;
};

export const useSetReceipts = () => {
   const setReceipts = useContext(setReceiptsContext);
   if (!setReceipts) {
      throw new Error('Component must be inside ReceiptProvider');
   }
   return setReceipts;
};

export const useReceipts = () => {
   const receipts = useContext(receiptsContext);
   return receipts;
};
