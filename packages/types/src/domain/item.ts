import { itemsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const itemSchema = createSelectSchema(itemsTable);
export const itemInputSchema = createInsertSchema(itemsTable, {
   quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

export type Item = v.InferOutput<typeof itemSchema>;
export type ItemInput = v.InferInput<typeof itemInputSchema>;
