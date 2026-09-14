import { invoicesTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const invoiceSchema = createSelectSchema(invoicesTable);
export const invoiceInputSchema = createInsertSchema(invoicesTable);

export type Invoice = v.InferOutput<typeof invoiceSchema>;
export type InvoiceInput = v.InferInput<typeof invoiceInputSchema>;
