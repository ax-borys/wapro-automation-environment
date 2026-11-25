import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';

export type CancelOrdersInput = InferRequestType<
   typeof client.order.orders.cancel.$post
>['json'];

export async function cancelOrders(ordersDataInput: CancelOrdersInput) {
   const response = await client.order.orders.cancel.$post({
      json: ordersDataInput,
   });

   if (!response.ok) {
      const { error } = await response.json();

      throw error;
   }

   const { data } = await response.json();

   return data;
}
