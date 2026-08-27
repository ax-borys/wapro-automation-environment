import { fetchOffers, obtainAuthTokens } from '@wae/allegro';

export async function getAllOffers() {
   const { accessToken } = await obtainAuthTokens();
   const offers = await fetchOffers(accessToken);

   return offers;
}
