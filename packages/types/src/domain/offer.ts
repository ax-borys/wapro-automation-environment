import { offersTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const offerSchema = v.object({
   ...createSelectSchema(offersTable).entries,
});

export const offerInputSchema = v.object({
   ...createInsertSchema(offersTable).entries,
});

export type Offer = v.InferOutput<typeof offerSchema>;
export type OfferInput = v.InferInput<typeof offerInputSchema>;
