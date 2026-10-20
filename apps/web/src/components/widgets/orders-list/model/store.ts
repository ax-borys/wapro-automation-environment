import { OrderModel } from '@/entities/order';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type OrdersListFilters = {
   requiredDocumentType: 'RECEIPT' | 'INVOICE' | 'ALL';
};

export type OrdersListStore = {
   sortedOrderIds: Set<OrderModel['id']>;
   filters: OrdersListFilters;

   setRequiredDocumentTypeFilter: (
      filter: OrdersListFilters['requiredDocumentType'],
   ) => void;

   setSortedOrderIds: (set: Set<OrderModel['id']>) => void;
};

export const useOrdersListStore = create<OrdersListStore>()(
   immer((set, get) => ({
      sortedOrderIds: new Set([]),
      filters: { requiredDocumentType: 'ALL' },
      setRequiredDocumentTypeFilter: (filter) =>
         set((draft) => {
            draft.filters.requiredDocumentType = filter;
         }),
      setSortedOrderIds: (setIds) =>
         set((draft) => {
            draft.sortedOrderIds = setIds;
         }),
   })),
);
