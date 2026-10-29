import { client } from '@/lib/client';
import { OrderModel } from '../types';
import { serverFullOrderToOrderModel } from '../mappers/server-full-order-to-order-model';

export async function fetchPendingOrders(): Promise<OrderModel[]> {
   const response = await client.order.orders.pending.$get();

   if (!response.ok) {
      const { error } = await response.json();
      throw error;
   }

   const { data: orders } = await response.json();

   const transformedOrders = orders.map(serverFullOrderToOrderModel);

   return transformedOrders;
}
