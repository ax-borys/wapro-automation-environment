import { db, customersTable } from '@wae/db';

export async function getCustomers() {
   const customers = await db.select().from(customersTable);

   return customers;
}
