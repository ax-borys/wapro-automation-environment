'use client';
import { GenerateReceiptInput } from '@wae/receipt';
import { createContext, ReactNode, useContext } from 'react';

export type Order = Omit<GenerateReceiptInput, 'items'> & {
   orderId: string;
   imgSrc: string;
   items: (GenerateReceiptInput['items'][number] & { name: string })[];
   buyerFullname: string;
   orderProcessedAt: string;
};

const ordersContext = createContext<Order[]>([]);

export function OrdersProvider({
   children,
   value,
}: {
   children: ReactNode;
   value: Order[];
}) {
   return (
      <ordersContext.Provider value={value}>{children}</ordersContext.Provider>
   );
}

export const useOrders = () => {
   const orders = useContext(ordersContext);

   return orders;
};
