import { type GetAllOffersWithItemsOutput } from '@wae/offer';
import { client } from '@/lib/client';

export async function fetchAllOffersWithItems() {
   const response = await client.offer.include.items.$get();

   if (!response.ok) {
      throw (await response.json()).error;
   }

   const result = await response.json();

   return result.data;
}
