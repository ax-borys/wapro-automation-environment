import { CreateOfferInput } from '@wae/offer';
import { fetchOffers, QueryParams } from './fetch-offers';
import { store } from '../store/store';
import { obtainAuthTokens } from '../auth/obtain-auth-tokens';
import { RawOffer } from './offer';
import { mapOffer } from './map-offer';
import { customersTable } from '@wae/db';

function customDeliveryOffer(): CreateOfferInput {
   return {
      externalId: 'delivery',
      src: 'allegro',
      imgSrc: 'placeholder',
      title: 'Delivery',
   };
}

export async function getAllOffers(): Promise<CreateOfferInput[]> {
   let { accessToken } = await obtainAuthTokens();

   const queryParams: QueryParams = {
      limit: '1000',
   };

   const response = await fetchOffers(accessToken, queryParams);
   const offers = response.offers.map(mapOffer);

   offers.push(customDeliveryOffer());

   return offers;
}
