import { CreateOfferInput } from '@wae/offer';
import { fetchOffers, QueryParams } from './fetch-offers';
import { store } from '../store/store';
import { obtainAuthTokens } from '../auth/obtain-auth-tokens';
import { RawOffer } from './offer';
import { mapOffer } from './map-offer';

export async function getAllOffers(): Promise<CreateOfferInput[]> {
   let { accessToken } = await obtainAuthTokens();

   const queryParams: QueryParams = {
      limit: '1000',
   };

   const response = await fetchOffers(accessToken, queryParams);
   return response.offers.map(mapOffer);
}
