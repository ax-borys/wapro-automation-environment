import { client } from '@/lib/client';
import { normalizeFullOrder } from '../normalizers/normalize-full-order';

export async function fetchPendingOrders() {
   const response = await client.order.orders.pending.$get();

   if (!response.ok) {
      const { error } = await response.json();
      throw error;
   }

   const { data: orders } = await response.json();

   return orders.map(normalizeFullOrder);
}
