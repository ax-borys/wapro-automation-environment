import { customersTable, db } from '@wae/db';
import { Customer, customerInputSchema, Tx } from '@wae/types';
import { and, eq, or } from 'drizzle-orm';
import * as v from 'valibot';

const obtainCustomersInputSchema = v.pipe(
   v.array(customerInputSchema),
   v.nonEmpty(),
);

type ObtainCustomersInput = v.InferOutput<typeof obtainCustomersInputSchema>;

export async function obtainCustomers(
   tx: Tx,
   input: ObtainCustomersInput,
): Promise<Customer[]> {
   const conditions = input
      .map((i) =>
         i.id
            ? eq(customersTable.id, i.id)
            : i.externalId
              ? eq(customersTable.externalId, i.externalId)
              : null,
      )
      .filter((i): i is NonNullable<typeof i> => i !== null);

   const existingCustomers = await tx
      .select()
      .from(customersTable)
      .where(or(...conditions));

   if (input.length === existingCustomers.length) {
      return existingCustomers;
   }

   const existingIds = new Set(
      existingCustomers
         .map((customer) => customer.id)
         .filter((id): id is NonNullable<typeof id> => id !== null),
   );

   const existingExternalIds = new Set(
      existingCustomers
         .map((customer) => customer.externalId)
         .filter(
            (externalId): externalId is NonNullable<typeof externalId> =>
               externalId !== null,
         ),
   );

   const nonExistingCustomersInput = input.filter((i) => {
      const matchedById = i.id ? existingIds.has(i.id) : false;
      const matchedByExternalId = i.externalId
         ? existingExternalIds.has(i.externalId)
         : false;

      return !matchedById && !matchedByExternalId;
   });

   const customers = await tx
      .insert(customersTable)
      .values(nonExistingCustomersInput)
      .returning();

   return [...existingCustomers, ...customers];
}
