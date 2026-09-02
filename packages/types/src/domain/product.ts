import { productsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const productSchema = createSelectSchema(productsTable);
export const productInputSchema = createInsertSchema(productsTable);

export type Product = v.InferOutput<typeof productSchema>;
export type ProductInput = v.InferInput<typeof productInputSchema>;
