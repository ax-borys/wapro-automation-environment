import { db, offersTable } from '@wae/db';
import { Offer, OfferInput, Tx } from '@wae/types';

export type CreateOfferInput = OfferInput;
export type CreateOfferReturn = Promise<Offer>;

export async function createOffer(
   tx: Tx,
   offerInput: CreateOfferInput,
): CreateOfferReturn {
   const [offer] = await tx.insert(offersTable).values(offerInput).returning();
   return offer;
}
