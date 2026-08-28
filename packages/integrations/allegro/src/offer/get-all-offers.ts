import { CreateOfferInput } from '@wae/offer';
import { fetchOffers, QueryParams } from './fetch-offers';
import { store } from '../store/store';
import { obtainAuthTokens } from '../auth/obtain-auth-tokens';
import { RawOffer } from './offer';
import { mapOffer } from './map-offer';

export async function getAllOffers(): Promise<CreateOfferInput[]> {
   let { accessToken } = store.getState();

   const queryParams: QueryParams = {
      limit: '1000',
   };

   if (!accessToken) {
      const { accessToken: newAccessToken } = await obtainAuthTokens();
      const response = await fetchOffers(newAccessToken, queryParams);
      return response.offers.map(mapOffer);
   } else {
      const response = await fetchOffers(accessToken, queryParams);
      return response.offers.map(mapOffer);
   }
}
