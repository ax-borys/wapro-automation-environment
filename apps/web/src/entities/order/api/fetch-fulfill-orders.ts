import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';
import { OrderModel } from '../types';
import { serverFullOrderToOrderModel } from '../mappers/server-full-order-to-order-model';

type Input = InferRequestType<
   typeof client.order.orders.fulfilled.$post
>['json'];

export async function fetchFulfilledOrders(
   input: Input,
): Promise<OrderModel[]> {
   console.log('Input: ', input);
   const response = await client.order.orders.fulfilled.$post({ json: input });

   if (!response.ok) {
      const { error } = await response.json();

      throw error;
   }

   const { data: orders } = await response.json();

   const transformedOrders = orders
      .map(serverFullOrderToOrderModel)
      .filter((order) => order.original.status === 'FULFILLED');

   return transformedOrders;
}
