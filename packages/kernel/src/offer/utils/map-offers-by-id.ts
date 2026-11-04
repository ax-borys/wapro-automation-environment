import { Offer } from '@wae/types';

export function mapOffersById<T extends { id: Offer['id'] }>(
   offers: T[],
): Map<T['id'], T> {
   const mappedOffers = new Map();

   for (const offer of offers) {
      mappedOffers.set(offer.id, offer);
   }

   return mappedOffers;
}
