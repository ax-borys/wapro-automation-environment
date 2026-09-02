import { client } from '@/lib/client';

export async function fetchMockPendingOrders() {
   const response = await client.order.mock.orders.peinding.$get();

   if (!response.ok) {
      const { error } = await response.json();
      throw error;
   }

   const { data: offers } = await response.json();

   return offers;
}
