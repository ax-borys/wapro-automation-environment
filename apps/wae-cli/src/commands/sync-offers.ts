import * as allegro from '@wae/allegro';
import {
   createOffer,
   CreateOfferOutput,
   getAllOffersWithItems,
   getAllOffers,
} from '@wae/offer';

export async function syncOffers() {
   const offers = await allegro.getAllOffers();

   const createdOffers: CreateOfferOutput[] = [];

   const existingOffers = await getAllOffers();

   for (const offer of offers) {
      if (existingOffers.map((i) => i.externalId).includes(offer.externalId))
         return;
      const ret = await createOffer(offer);
      createdOffers.push(ret);
   }

   return createdOffers;
}
