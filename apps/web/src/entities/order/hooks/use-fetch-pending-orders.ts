import { fetchPendingOrders } from '../api/fetch-pending-orders';
import { serverFullOrderToOrderModel } from '../mappers/server-full-order-to-order-model';
import { OrderModel } from '../types';

export function useFetchPendingOrders(
   storedOrders: Record<OrderModel['id'], OrderModel>,
): () => Promise<OrderModel[]> {
   return async () => {
      const orders = await fetchPendingOrders();

      const mappedOrders = orders.map((order) => {
         const storedOrder = storedOrders[order.id];

         return serverFullOrderToOrderModel(
            order,
            storedOrder
               ? {
                    isSelected: storedOrder.isSelected,
                    invoice: storedOrder.invoice,
                    receipt: storedOrder.receipt,
                 }
               : undefined,
         );
      });

      return mappedOrders;
   };
}
