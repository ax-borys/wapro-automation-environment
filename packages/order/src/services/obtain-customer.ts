import { customersTable, db } from '@wae/db';
import { Customer, customerInputSchema, Tx } from '@wae/types';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

const obtainCustomerInputSchema = customerInputSchema;

type ObtainCustomerInput = v.InferOutput<typeof obtainCustomerInputSchema>;

export async function obtainCustomer(
   tx: Tx,
   input: ObtainCustomerInput,
): Promise<Customer> {
   const conditions = [];

   if (input.companyName) {
      conditions.push(eq(customersTable.companyName, input.companyName));
   }

   if (input.email) {
      conditions.push(eq(customersTable.email, input.email));
   }

   if (input.externalId) {
      conditions.push(eq(customersTable.externalId, input.externalId));
   }

   if (input.firstName) {
      conditions.push(eq(customersTable.firstName, input.firstName));
   }

   if (input.lastName) {
      conditions.push(eq(customersTable.lastName, input.lastName));
   }

   if (input.phoneNumber) {
      conditions.push(eq(customersTable.phoneNumber, input.phoneNumber));
   }

   const [existingCustomer] = await db
      .select()
      .from(customersTable)
      .where(and(...conditions));

   if (existingCustomer) {
      return existingCustomer;
   }

   const [customer] = await tx.insert(customersTable).values(input).returning();

   return customer;
}
