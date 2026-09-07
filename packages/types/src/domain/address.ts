import { addressesTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const addressBaseSchema = createSelectSchema(addressesTable);
export const addressBaseInputSchema = createInsertSchema(addressesTable);

export const addressSchema = v.union([
   v.object({
      ...addressBaseSchema.entries,
      customerId: v.nonNullish(addressBaseSchema.entries.customerId),
      deliveryId: v.nonNullish(addressBaseSchema.entries.deliveryId),
   }),
   v.object({
      ...addressBaseSchema.entries,
      deliveryId: v.nonNullish(addressBaseSchema.entries.deliveryId),
   }),
   v.object({
      ...addressBaseSchema.entries,
      customerId: v.nonNullish(addressBaseSchema.entries.customerId),
   }),
]);
export const addressInputSchema = v.union([
   v.object({
      ...addressBaseInputSchema.entries,
      customerId: v.nonNullish(addressBaseInputSchema.entries.customerId),
      deliveryId: v.nonNullish(addressBaseInputSchema.entries.deliveryId),
   }),
   v.object({
      ...addressBaseInputSchema.entries,
      deliveryId: v.nonNullish(addressBaseInputSchema.entries.deliveryId),
   }),
   v.object({
      ...addressBaseInputSchema.entries,
      customerId: v.nonNullish(addressBaseInputSchema.entries.customerId),
   }),
]);

export type Address = v.InferOutput<typeof addressSchema>;
export type AddressInput = v.InferInput<typeof addressInputSchema>;
