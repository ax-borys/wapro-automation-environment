import { db, offersTable } from '@wae/db';
import { OfferInput } from '@wae/types';

export function generateTestOffer(): OfferInput {
   return {
      externalId: 'external-1',
      imgSrc: 'https://placeholder.com/128x128',
      title: 'Title for test product #1',
      src: 'test',
   };
}

export async function seedOffer(offerInput: OfferInput) {
   const [offer] = await db.insert(offersTable).values(offerInput).returning();

   return offer;
}
