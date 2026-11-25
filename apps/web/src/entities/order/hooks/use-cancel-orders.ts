import { cancelOrders } from '../api/cancel-orders';
import { useOrdersStore } from '../orders.store';
import { OrderModel } from '../types';

export function useCancelOrders() {
   const { patchOrder } = useOrdersStore();

   return async (ids: OrderModel['id'][]) => {
      if (!ids.length) return;

      const cancelledOrders = await cancelOrders(ids);

      for (const order of cancelledOrders) {
         patchOrder(order);
      }

      return cancelledOrders;
   };
}
