import { ordersTable, positionsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { positionSchema, positionWithOfferSchema } from './position';

export const orderSchema = createSelectSchema(ordersTable, {
   paymentMethod: v.picklist(['PREPAID', 'POSTPAID']),
   status: v.picklist([
      'NEW',
      'READY_FOR_PROCESSING',
      'PROCESSING',
      'PROCESSED',
      'FULFILLED',
      'CANCELLED',
   ]),
   totalPaid: v.pipe(v.number(), v.integer(), v.minValue(0)),
   totalToPay: v.pipe(v.number(), v.integer(), v.minValue(0)),
   packages: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

export const orderWithPositionsWithOfferSchema = v.object({
   ...orderSchema.entries,
   positions: v.array(positionWithOfferSchema),
});

export const orderInputSchema = createInsertSchema(ordersTable, {
   paymentMethod: v.picklist(['PREPAID', 'POSTPAID']),
   status: v.picklist([
      'NEW',
      'READY_FOR_PROCESSING',
      'PROCESSING',
      'PROCESSED',
      'FULFILLED',
      'CANCELLED',
   ]),
   totalPaid: v.pipe(v.number(), v.integer(), v.minValue(0)),
   totalToPay: v.pipe(v.number(), v.integer(), v.minValue(0)),
   packages: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

export type Order = v.InferOutput<typeof orderSchema>;
export type OrderInput = v.InferInput<typeof orderInputSchema>;

export const orderPositionSchema = createSelectSchema(positionsTable);
export const orderPositionInputSchema = createInsertSchema(positionsTable);

export type OrderPoisition = v.InferOutput<typeof orderPositionSchema>;
export type OrderPoisitionInput = v.InferInput<typeof orderPositionInputSchema>;
