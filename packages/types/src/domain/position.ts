import { positionsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { offerInputSchema, offerSchema } from './offer';
import { itemInputSchema, itemSchema } from './item';
import { productInputSchema, productSchema } from './product';

export const positionSchema = createSelectSchema(positionsTable);
export const positionInputSchema = createInsertSchema(positionsTable, {
   quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
   price: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export const positionWithOfferSchema = v.object({
   ...positionSchema.entries,
   offer: offerSchema,
});

export const positionWithOfferInputSchema = v.object({
   ...positionInputSchema.entries,
   offer: offerInputSchema,
});

export const positionWithOfferAndItemsSchema = v.object({
   ...positionSchema.entries,
   offer: v.object({ ...offerSchema.entries, items: v.array(itemSchema) }),
});

export const positionWithOfferAndItemsInputSchema = v.object({
   ...positionInputSchema.entries,
   offer: v.object({
      ...offerInputSchema.entries,
      items: v.array(itemInputSchema),
   }),
});

export const fullPositionInputSchema = v.object({
   ...positionInputSchema.entries,
   offer: v.object({
      ...offerInputSchema.entries,
      items: v.array(
         v.object({ ...itemInputSchema.entries, product: productInputSchema }),
      ),
   }),
});

export const fullPositionSchema = v.object({
   ...positionSchema.entries,
   offer: v.object({
      ...offerSchema.entries,
      items: v.array(
         v.object({ ...itemSchema.entries, product: productSchema }),
      ),
   }),
});

export type Position = v.InferOutput<typeof positionSchema>;
export type PositionInput = v.InferInput<typeof positionInputSchema>;
