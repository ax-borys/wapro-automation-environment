import { originalImgSrcTos128b } from '@wae/allegro';
import { db, offersTable } from '@wae/db';
import { getAllOffers, Offer } from '@wae/offer';
import { eq } from 'drizzle-orm';

export async function convertImgSrcToS128b() {
   const offers = await getAllOffers();

   const newOffers: Offer[] = [];
   for (const offer of offers) {
      const [newOffer] = await db
         .update(offersTable)
         .set({ imgSrc: originalImgSrcTos128b(offer.imgSrc) ?? offer.imgSrc })
         .where(eq(offersTable.id, offer.id))
         .returning();

      newOffers.push(newOffer);
   }

   return newOffers;
}
