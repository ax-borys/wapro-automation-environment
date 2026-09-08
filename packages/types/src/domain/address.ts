import { addressesTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const addressSchema = createSelectSchema(addressesTable);
export const addressInputSchema = createInsertSchema(addressesTable);

export type Address = v.InferOutput<typeof addressSchema>;
export type AddressInput = v.InferInput<typeof addressInputSchema>;
