import { ApiResponse } from '@wae/types';
import { Offer } from '@wae/offer';

export async function fetchOffers() {
   const response = await fetch('http://localhost:8082/get-offers');

   const result = (await response.json()) as ApiResponse<Offer[]>;

   return result.data ? result.data : [];
}
