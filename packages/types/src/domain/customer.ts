import { addressesTable, customersTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const customerSchema = createSelectSchema(customersTable);
export const customerInputSchema = createInsertSchema(customersTable);

export type Customer = v.InferOutput<typeof customerSchema>;
export type CustomerInput = v.InferInput<typeof customerInputSchema>;

export const addressSchema = createSelectSchema(addressesTable);
export const addressInputSchema = createInsertSchema(addressesTable);

export type Address = v.InferOutput<typeof addressSchema>;
export type AddressInput = v.InferInput<typeof addressInputSchema>;
