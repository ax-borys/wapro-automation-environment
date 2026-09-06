import { positionsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { offerSchema } from './offer';

export const positionSchema = createSelectSchema(positionsTable);
export const positionInputSchema = createInsertSchema(positionsTable, {
   quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
   price: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export const positionWithOfferSchema = v.object({
   ...positionSchema.entries,
   offer: offerSchema,
});

export type Position = v.InferOutput<typeof positionSchema>;
export type PositionInput = v.InferInput<typeof positionInputSchema>;
