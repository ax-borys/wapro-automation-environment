import { deliveriesTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const deliverySchema = createSelectSchema(deliveriesTable);
export const deliveryInputSchema = createInsertSchema(deliveriesTable);

export type Delivery = v.InferOutput<typeof deliverySchema>;
export type DeliveryInput = v.InferInput<typeof deliveryInputSchema>;
