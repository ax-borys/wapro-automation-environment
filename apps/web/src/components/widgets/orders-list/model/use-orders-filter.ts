import { OrderModel } from '@/entities/order';
import { useOrdersListStore } from './store';

type Filter = (orders: OrderModel[]) => OrderModel[];

export const useOrdersFilter = (): Filter => {
   const filters = useOrdersListStore((s) => s.filters);

   return (orders) => {
      return orders.filter((order) => {
         if (filters.requiredDocumentType !== 'ALL') {
            if (order.requiredDocumentType !== filters.requiredDocumentType) {
               return false;
            }

            return true;
         }
         return true;
      });
   };
};
