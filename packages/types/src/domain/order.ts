import { ordersTable, positionsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const orderSchema = createSelectSchema(ordersTable, {
   paymentMethod: v.picklist(['PREPAID', 'POSTPAID']),
   status: v.picklist(['NEW', 'READY_FOR_PROCESSING', 'FULFILLED']),
});

export const orderInputSchema = createInsertSchema(ordersTable, {
   paymentMethod: v.picklist(['PREPAID', 'POSTPAID']),
   status: v.picklist(['NEW', 'READY_FOR_PROCESSING', 'FULFILLED']),
});

export type Order = v.InferOutput<typeof orderSchema>;
export type OrderInput = v.InferInput<typeof orderInputSchema>;

export const orderPositionSchema = createSelectSchema(positionsTable);
export const orderPositionInputSchema = createInsertSchema(positionsTable);

export type OrderPoisition = v.InferOutput<typeof orderPositionSchema>;
export type OrderPoisitionInput = v.InferInput<typeof orderPositionInputSchema>;
