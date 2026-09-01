import { ordersTable } from '@wae/db/src/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const orderSchema = createSelectSchema(ordersTable);
export const orderInputSchema = createInsertSchema(ordersTable);

export type Order = v.InferOutput<typeof orderSchema>;
export type OrderInput = v.InferInput<typeof orderInputSchema>;
