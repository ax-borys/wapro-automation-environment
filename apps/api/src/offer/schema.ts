import { offersTable } from '@wae/db';
import { createInsertSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const addOfferInputSchema = createInsertSchema(offersTable);

export type AddOfferInput = v.InferInput<typeof addOfferInputSchema>;
