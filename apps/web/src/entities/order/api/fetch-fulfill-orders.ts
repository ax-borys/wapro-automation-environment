import { client } from '@/lib/client';
import { InferRequestType } from 'hono/client';

type Input = InferRequestType<
   typeof client.order.orders.fulfilled.$post
>['json'];

export async function fetchFulfilledOrders(input: Input) {
   console.log('Input: ', input);
   const response = await client.order.orders.fulfilled.$post({ json: input });

   if (!response.ok) {
      const { error } = await response.json();

      throw error;
   }

   const { data } = await response.json();

   return data;
}
