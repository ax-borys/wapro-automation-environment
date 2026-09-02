import { positionsTable, receiptsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const receiptSchema = createSelectSchema(receiptsTable);
export const receiptInputSchema = createInsertSchema(receiptsTable);

export type Receipt = v.InferOutput<typeof receiptSchema>;
export type ReceiptInput = v.InferInput<typeof receiptInputSchema>;

export const receiptPositionSchema = createSelectSchema(positionsTable);
export const receiptPositionInputSchema = createInsertSchema(positionsTable);

export type ReceiptPosition = v.InferOutput<typeof receiptPositionSchema>;
export type ReceiptPositionInput = v.InferInput<
   typeof receiptPositionInputSchema
>;
