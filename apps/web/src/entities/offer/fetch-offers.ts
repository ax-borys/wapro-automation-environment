import { ApiResponse } from '@wae/types';
import { Offer } from '@wae/offer';
import { client } from '@/lib/client';

export async function fetchOffers() {
   const response = await client.offer.$get();

   if (!response.ok) {
      const result = await response.json();
      throw result.error;
   }

   const result = await response.json();

   return result.data;
}
