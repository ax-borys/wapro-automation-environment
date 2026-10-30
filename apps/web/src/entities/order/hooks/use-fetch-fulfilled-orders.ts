import { fetchFulfilledOrders } from '../api/fetch-fulfill-orders';
import { serverFullOrderToOrderModel } from '../mappers/server-full-order-to-order-model';
import { OrderModel } from '../types';

type FetchFulfilledOrdersParams = Parameters<typeof fetchFulfilledOrders>;

export function useFetchFulfilledOrders(
   storedOrders: Record<OrderModel['id'], OrderModel>,
): (...args: FetchFulfilledOrdersParams) => Promise<OrderModel[]> {
   return async (...args: FetchFulfilledOrdersParams) => {
      const orders = await fetchFulfilledOrders(...args);

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
