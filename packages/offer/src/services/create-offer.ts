import { db, offersTable } from '@wae/db';
import { CreateOfferInput, CreateOfferOutput } from '../schemas';

export type CreateOfferReturn = Promise<null | CreateOfferOutput>;

export async function createOffer(offer: CreateOfferInput): CreateOfferReturn {
   let result = null;

   await db.transaction(async (tx) => {
      result = (
         await tx
            .insert(offersTable)
            .values(offer)
            .returning({ id: offersTable.id })
      )[0];
   });

   return result;
}
