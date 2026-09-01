import { offersTable } from '@wae/db/src/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const offerSchema = createSelectSchema(offersTable);
export const offerInputSchema = createInsertSchema(offersTable);

export type Offer = v.InferOutput<typeof offerSchema>;
export type OfferInput = v.InferInput<typeof offerInputSchema>;
