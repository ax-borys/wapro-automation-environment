import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type OrdersListFilters = {
   requiredDocumentType: 'RECEIPT' | 'INVOICE' | 'ALL';
};

export type OrdersListStore = {
   filters: OrdersListFilters;
   setRequiredDocumentTypeFilter: (
      filter: OrdersListFilters['requiredDocumentType'],
   ) => void;
};

export const useOrdersListStore = create<OrdersListStore>()(
   immer((set, get) => ({
      filters: { requiredDocumentType: 'ALL' },
      setRequiredDocumentTypeFilter: (filter) =>
         set((draft) => {
            draft.filters.requiredDocumentType = filter;
         }),
   })),
);
