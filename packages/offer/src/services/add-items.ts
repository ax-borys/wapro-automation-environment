import { db, itemsTable, productsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const itemInputSchema = createInsertSchema(itemsTable);
export const itemOutputSchema = createSelectSchema(itemsTable);

export const addItemInputSchema = itemInputSchema;

export type AddItemInput = v.InferInput<typeof addItemInputSchema>;
export type AddItemOutput = v.InferOutput<typeof itemOutputSchema>;

export async function addItems(
   itemsInput: AddItemInput[],
): Promise<AddItemOutput[]> {
   const items = await db.insert(itemsTable).values(itemsInput).returning();

   return items;
}
