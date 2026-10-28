import { deliveriesTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { addressInputSchema, addressSchema } from './address';

export const deliverySchema = createSelectSchema(deliveriesTable);
export const deliveryInputSchema = createInsertSchema(deliveriesTable);

export type Delivery = v.InferOutput<typeof deliverySchema>;
export type DeliveryInput = v.InferInput<typeof deliveryInputSchema>;

export const deliveryWithAddressSchema = v.object({
   ...deliverySchema.entries,
   address: addressSchema,
});

export type DeliveryWithAddress = v.InferOutput<
   typeof deliveryWithAddressSchema
>;

export const deliveryWithAddressInputSchema = v.object({
   ...deliveryInputSchema.entries,
   address: addressInputSchema,
});

export type DeliveryWithAddressInput = v.InferInput<
   typeof deliveryWithAddressInputSchema
>;
