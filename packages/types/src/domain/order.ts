import { ordersTable, positionsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import {
   fullPositionInputSchema,
   fullPositionSchema,
   positionInputSchema,
   positionSchema,
   positionWithOfferAndItemsInputSchema,
   positionWithOfferAndItemsSchema,
   positionWithOfferInputSchema,
   positionWithOfferSchema,
} from './position';
import {
   customerSchema,
   customerWithAddressInputSchema,
   customerWithAddressSchema,
} from './customer';
import {
   recipientSchema,
   recipientWithAddressInputSchema,
   recipientWithAddressSchema,
} from './recipient';
import {
   deliverySchema,
   deliveryWithAddressInputSchema,
   deliveryWithAddressSchema,
} from './delivery';
import { invoiceInputSchema, invoiceSchema } from './invoice';
import { receiptInputSchema, receiptSchema } from './receipt';

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
   requiredDocumentType: v.picklist(['RECEIPT', 'INVOICE']),
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
   requiredDocumentType: v.optional(v.picklist(['RECEIPT', 'INVOICE'])),
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

export const fullOrderShema = v.object({
   ...orderSchema.entries,
   customer: customerWithAddressSchema,
   recipient: recipientWithAddressSchema,
   delivery: deliveryWithAddressSchema,
   invoice: v.nullable(invoiceSchema),
   receipt: v.nullable(receiptSchema),
   positions: v.array(fullPositionSchema),
});

export type FullOrder = v.InferOutput<typeof fullOrderShema>;

export const fullOrderInputShema = v.object({
   ...orderInputSchema.entries,
   customer: customerWithAddressInputSchema,
   recipient: recipientWithAddressInputSchema,
   delivery: deliveryWithAddressInputSchema,
   invoice: v.nullish(invoiceInputSchema),
   receipt: v.nullish(receiptInputSchema),
   positions: v.array(fullPositionInputSchema),
});

export type FullOrderInput = v.InferInput<typeof fullOrderInputShema>;
