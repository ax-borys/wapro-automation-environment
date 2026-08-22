import { itemsTable, offersTable, productsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

// Offer
const offerInputSchema = createInsertSchema(offersTable);
const offerOutputSchema = createSelectSchema(offersTable);

export const createOfferInputSchema = offerInputSchema;
export const createOfferOutputSchema = offerOutputSchema;

export type CreateOfferInput = v.InferInput<typeof createOfferInputSchema>;
export type CreateOfferOutput = v.InferOutput<typeof createOfferOutputSchema>;
export type Offer = v.InferOutput<typeof offerOutputSchema>;

// Item
const itemInputSchema = createInsertSchema(itemsTable);
const productInputSchema = createInsertSchema(productsTable);
const itemOutputSchema = createSelectSchema(itemsTable);
const productOutputSchema = createSelectSchema(productsTable);
const itemsOutputSchema = v.array(itemOutputSchema);
const productsOutputSchema = v.array(productOutputSchema);

export const addItemInputSchema = v.object({
   item: v.omit(itemInputSchema, ['productId']),
   product: productInputSchema,
});

export const addItemsInputSchema = v.array(addItemInputSchema);

export type AddItemInput = v.InferInput<typeof addItemInputSchema>;
export type AddItemsReturn = {
   items: v.InferOutput<typeof itemsOutputSchema>;
   products: v.InferOutput<typeof productsOutputSchema>;
};
