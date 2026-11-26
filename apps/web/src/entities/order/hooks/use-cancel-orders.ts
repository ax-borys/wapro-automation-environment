import { cancelOrders } from '../api/cancel-orders';
import { useOrdersStore } from '../orders.store';
import { OrderModel } from '../types';
import { normalizeDateFields } from '@wae/kernel';

export function useCancelOrders() {
   const { patchOrder } = useOrdersStore();

   return async (ids: OrderModel['id'][]) => {
      if (!ids.length) return;

      const cancelledOrders = await cancelOrders(ids);

      for (const order of cancelledOrders) {
         patchOrder(
            normalizeDateFields(order, [
               'createdAt',
               'preparedAt',
               'fulfilledAt',
            ]),
         );
      }

      return cancelledOrders;
   };
}
