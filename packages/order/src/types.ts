import { ordersTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const orderInputSchema = createInsertSchema(ordersTable);
export const orderSchema = createSelectSchema(ordersTable);

export type OrderInput = v.InferInput<typeof orderInputSchema>;
export type Order = v.InferOutput<typeof orderSchema>;
