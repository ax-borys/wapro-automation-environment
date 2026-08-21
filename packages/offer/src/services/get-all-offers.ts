import { db, offersTable } from '@wae/db';
import { Offer } from '../schemas';

export async function getAllOffers(): Promise<Offer[]> {
   const result = await db.transaction(
      async (tx) => await tx.select().from(offersTable),
   );

   return result;
}
