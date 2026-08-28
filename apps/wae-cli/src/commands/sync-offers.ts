import { getAllOffers } from '@wae/allegro';
import { createOffer, CreateOfferOutput } from '@wae/offer';

export async function syncOffers() {
   const offers = await getAllOffers();

   const createdOffers: CreateOfferOutput[] = [];

   for (const offer of offers) {
      const ret = await createOffer(offer);
      createdOffers.push(ret);
   }

   return createdOffers;
}
