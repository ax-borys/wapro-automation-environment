import { db, productsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const productInputSchema = createInsertSchema(productsTable, {
   tax: v.picklist([0, 8, 23]),
});

export const productOutputSchema = createSelectSchema(productsTable);

export const addProductInputSchema = productInputSchema;

export type AddProductInput = v.InferInput<typeof addProductInputSchema>;

export type AddProductOutput = v.InferOutput<typeof productOutputSchema>;

export async function addProducts(
   productsInput: AddProductInput[],
): Promise<AddProductOutput[]> {
   const products = await db
      .insert(productsTable)
      .values(productsInput)
      .returning();

   return products;
}
