import { sqliteDb } from '@wae/db';
import { offersTable } from '@wae/db';
import type { AddOfferInput } from './schema.js';

export async function addOffer(offer: AddOfferInput) {
   const result = await sqliteDb.insert(offersTable).values(offer);
   return result;
}
