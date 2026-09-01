import { receiptsTable } from '@wae/db/src/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const receiptSchema = createSelectSchema(receiptsTable);
export const receiptInputSchema = createInsertSchema(receiptsTable);

export type Receipt = v.InferOutput<typeof receiptSchema>;
export type ReceiptInput = v.InferInput<typeof receiptInputSchema>;
