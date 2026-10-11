import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';

export type FulfillOrdersInput = InferRequestType<
   typeof client.order.fulfill.orders.$post
>['json'];

export async function fulfillOrders<T extends FulfillOrdersInput>(
   ordersDataInput: T,
) {
   const response = await client.order.fulfill.orders.$post({
      json: ordersDataInput,
   });

   if (!response.ok) {
      const { error } = await response.json();

      throw error;
   }

   const { data } = await response.json();

   return data;
}
