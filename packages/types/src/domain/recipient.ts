import { recipientsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

export const recipientBaseSchema = createSelectSchema(recipientsTable);
export const recipientBaseInputSchema = createInsertSchema(recipientsTable);

export const recipientFullSchema = v.object({
   ...recipientBaseSchema.entries,
   firstName: v.nonNullish(recipientBaseSchema.entries.firstName),
   lastName: v.nonNullish(recipientBaseSchema.entries.lastName),
   companyName: v.nonNullish(recipientBaseSchema.entries.companyName),
});

export const recipientWithFullNameSchema = v.object({
   ...recipientBaseSchema.entries,
   firstName: v.nonNullish(recipientBaseSchema.entries.firstName),
   lastName: v.nonNullish(recipientBaseSchema.entries.lastName),
});

export const recipientWithCompanyNameSchema = v.object({
   ...recipientBaseSchema.entries,
   companyName: v.nonNullish(recipientBaseSchema.entries.companyName),
});

export const recipientSchema = v.union([
   recipientFullSchema,
   recipientWithFullNameSchema,
   recipientWithCompanyNameSchema,
]);

export const recipientFullInputSchema = v.object({
   ...recipientBaseInputSchema.entries,
   firstName: v.nonNullish(recipientBaseInputSchema.entries.firstName),
   lastName: v.nonNullish(recipientBaseInputSchema.entries.lastName),
   companyName: v.nonNullish(recipientBaseInputSchema.entries.companyName),
});

export const recipientWithFullNameInputSchema = v.object({
   ...recipientBaseInputSchema.entries,
   firstName: v.nonNullish(recipientBaseInputSchema.entries.firstName),
   lastName: v.nonNullish(recipientBaseInputSchema.entries.lastName),
});

export const recipientWithCompanyNameInputSchema = v.object({
   ...recipientBaseInputSchema.entries,
   companyName: v.nonNullish(recipientBaseInputSchema.entries.companyName),
});

export const recipientInputSchema = v.union([
   recipientFullInputSchema,
   recipientWithFullNameInputSchema,
   recipientWithCompanyNameInputSchema,
]);

export type Recipient = v.InferOutput<typeof recipientSchema>;
export type RecipientInput = v.InferInput<typeof recipientInputSchema>;
