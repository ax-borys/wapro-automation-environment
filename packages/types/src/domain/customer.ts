import { addressesTable, customersTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

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

export const customerInputSchema = v.union([]);

export type Customer = v.InferOutput<typeof customerSchema>;
export type CustomerInput = v.InferInput<typeof customerInputSchema>;
