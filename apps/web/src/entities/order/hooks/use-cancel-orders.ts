import { useError } from '@/entities/error';
import { cancelOrders } from '../api/cancel-orders';
import { useOrdersStore } from '../orders.store';
import { OrderModel } from '../types';
import { normalizeDateFields } from '@wae/kernel';

export function useCancelOrders() {
   const { patchOrder } = useOrdersStore();
   const { raiseError } = useError();

   return async (ids: OrderModel['id'][]) => {
      if (!ids.length) return;

      const cancelledOrders = await cancelOrders(ids).catch((e) =>
         raiseError(e),
      );

      if (!cancelledOrders) return;

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
