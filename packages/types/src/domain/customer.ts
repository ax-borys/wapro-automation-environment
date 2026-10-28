import { addressesTable, customersTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { addressInputSchema, addressSchema } from './address';

export const customerBaseSchema = createSelectSchema(customersTable);
export const customerBaseInputSchema = createInsertSchema(customersTable);

export const customerFullSchema = v.object({
   ...customerBaseSchema.entries,
   firstName: v.nonNullish(customerBaseSchema.entries.firstName),
   lastName: v.nonNullish(customerBaseSchema.entries.lastName),
   companyName: v.nonNullish(customerBaseSchema.entries.companyName),
});

export const customerWithFullNameSchema = v.object({
   ...customerBaseSchema.entries,
   firstName: v.nonNullish(customerBaseSchema.entries.firstName),
   lastName: v.nonNullish(customerBaseSchema.entries.lastName),
});

export const customerWithCompanyNameSchema = v.object({
   ...customerBaseSchema.entries,
   companyName: v.nonNullish(customerBaseSchema.entries.companyName),
});

export const customerSchema = v.union([
   customerFullSchema,
   customerWithFullNameSchema,
   customerWithCompanyNameSchema,
]);

export const customerFullInputSchema = v.object({
   ...customerBaseInputSchema.entries,
   firstName: v.nonNullish(customerBaseInputSchema.entries.firstName),
   lastName: v.nonNullish(customerBaseInputSchema.entries.lastName),
   companyName: v.nonNullish(customerBaseInputSchema.entries.companyName),
});

export const customerWithFullNameInputSchema = v.object({
   ...customerBaseInputSchema.entries,
   firstName: v.nonNullish(customerBaseInputSchema.entries.firstName),
   lastName: v.nonNullish(customerBaseInputSchema.entries.lastName),
});

export const customerWithCompanyNameInputSchema = v.object({
   ...customerBaseInputSchema.entries,
   companyName: v.nonNullish(customerBaseInputSchema.entries.companyName),
});

export const customerInputSchema = v.union([
   customerFullInputSchema,
   customerWithFullNameInputSchema,
   customerWithCompanyNameInputSchema,
]);

export type Customer = v.InferOutput<typeof customerSchema>;
export type CustomerInput = v.InferInput<typeof customerInputSchema>;

export const customerWithAddressSchema = v.union([
   v.object({ ...customerFullSchema.entries, address: addressSchema }),
   v.object({ ...customerWithFullNameSchema.entries, address: addressSchema }),
   v.object({
      ...customerWithCompanyNameSchema.entries,
      address: addressSchema,
   }),
]);

export type CustomerWithAddress = v.InferOutput<
   typeof customerWithAddressSchema
>;

export const customerWithAddressInputSchema = v.union([
   v.object({
      ...customerFullInputSchema.entries,
      address: addressInputSchema,
   }),
   v.object({
      ...customerWithFullNameInputSchema.entries,
      address: addressInputSchema,
   }),
   v.object({
      ...customerWithCompanyNameInputSchema.entries,
      address: addressInputSchema,
   }),
]);

export type CustomerWithAddressInput = v.InferInput<
   typeof customerWithAddressInputSchema
>;
