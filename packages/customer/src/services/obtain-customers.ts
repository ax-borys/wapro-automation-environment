import { customersTable } from '@wae/db';
import { createObtainEntities } from '@wae/kernel';
import {
   customerFullInputSchema,
   customerWithCompanyNameInputSchema,
   customerWithFullNameInputSchema,
   customerSchema,
   Tx,
} from '@wae/types';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const customerInputSchema = v.union([
   v.omit(customerFullInputSchema, ['id']),
   v.omit(customerWithCompanyNameInputSchema, ['id']),
   v.omit(customerWithFullNameInputSchema, ['id']),
]);

const obtainCustomerInputSchema = customerInputSchema;
const obtainCustomerReturnSchema = customerSchema;

type ObtainCustomerInput = v.InferOutput<typeof obtainCustomerInputSchema>;
type ObtainCustomerReturnOutput = v.InferOutput<
   typeof obtainCustomerReturnSchema
>;

export async function obtainCustomers(
   tx: Tx,
   customersInput: ObtainCustomerInput[],
): Promise<ObtainCustomerReturnOutput[]> {
   const obtainEntities = createObtainEntities({
      table: customersTable,
      equal: (table, row) =>
         row.externalId ? eq(table.externalId, row.externalId) : undefined,
      transform: (customer, customerInput) => ({
         ...customer,
         clientTag: customerInput.clientTag || null,
      }),
      schema: customerInputSchema,
      returnSchema: obtainCustomerReturnSchema,
      compare: (customer1, customer2) =>
         customer1.externalId === customer2.externalId,
   });

   const customers = await obtainEntities(tx, customersInput);

   return customers;
}
