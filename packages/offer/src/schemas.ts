import { offersTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

const offerInputSchema = createInsertSchema(offersTable);
const offerOutputSchema = createSelectSchema(offersTable);

export const createOfferInputSchema = offerInputSchema;
export const createOfferOutputSchema = offerOutputSchema;

export type CreateOfferInput = v.InferInput<typeof createOfferInputSchema>;
export type CreateOfferOutput = v.InferOutput<typeof createOfferOutputSchema>;
export type Offer = v.InferOutput<typeof offerOutputSchema>;
