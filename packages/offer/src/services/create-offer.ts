import { db, offersTable } from '@wae/db';
import { CreateOfferInput, CreateOfferOutput } from '../schemas';

export type CreateOfferReturn = Promise<CreateOfferOutput>;

export async function createOffer(offer: CreateOfferInput): CreateOfferReturn {
   const result = await db.transaction(async (tx) => {
      const result = (
         await tx.insert(offersTable).values(offer).returning()
      )[0];
      return result;
   });

   return result;
}
