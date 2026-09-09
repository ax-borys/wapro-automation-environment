import { recipientsTable } from '@wae/db';
import { createObtainEntities } from '@wae/kernel';
import { recipientInputSchema, recipientSchema } from '@wae/types';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const obtainRecipientInputSchema = recipientInputSchema;
export const obtainRecipientReturnSchema = recipientSchema;

type ObtainRecipientOutput = v.InferOutput<typeof obtainRecipientInputSchema>;
type ObtainRecipientReturnOutput = v.InferOutput<
   typeof obtainRecipientReturnSchema
>;

export const obtainDeliveries: (
   deliveriesInput: ObtainRecipientOutput[],
) => Promise<ObtainRecipientReturnOutput[]> = createObtainEntities({
   table: recipientsTable,
   equal: (table, recipient) => eq(table.addressId, recipient.addressId),
   schema: obtainRecipientInputSchema,
   returnSchema: obtainRecipientReturnSchema,
   compare: (recipient1, recipient2) =>
      recipient1.addressId === recipient2.addressId,
});
