import { productsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const productSchema = createSelectSchema(productsTable, {
   tax: v.pipe(v.number(), v.integer(), v.picklist([0, 8, 23])),
});
export const productInputSchema = createInsertSchema(productsTable, {
   tax: v.pipe(v.number(), v.integer(), v.picklist([0, 8, 23])),
});

export type Product = v.InferOutput<typeof productSchema>;
export type ProductInput = v.InferInput<typeof productInputSchema>;
