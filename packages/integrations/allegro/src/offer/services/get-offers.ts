import { CreateOfferInput } from '@wae/offer';
import { fetchOffers, QueryParams } from '../api/fetch-offers';
import { obtainAuthTokens } from '../../auth/obtain-auth-tokens';
import { mapOffer } from '../mappers/map-offer';

export async function getOffersById(
   offerIds: string[],
): Promise<CreateOfferInput[]> {
   let { accessToken } = await obtainAuthTokens();

   const queryParams: QueryParams = {
      limit: '1000',
      'offer.id': offerIds,
   };

   const response = await fetchOffers(accessToken, queryParams);
   const offers = response.offers.map(mapOffer);

   return offers;
}
