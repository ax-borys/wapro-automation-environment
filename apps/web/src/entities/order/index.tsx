'use client';
import { CreateReceiptInput } from '@wae/receipt';
import { createContext, ReactNode, useContext } from 'react';

export type Item = CreateReceiptInput['positions'][number] & { imgSrc: string };

export type Order = Omit<
   Omit<CreateReceiptInput, 'positions'> & {
      positions: Item[];
      orderProcessedAt: string;
   },
   'fiscalNumber'
>;

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
