import { db, invoicesTable, ordersTable } from '@wae/db';
import { invoiceInputSchema, invoiceSchema } from '@wae/types';
import { inArray } from 'drizzle-orm';
import * as v from 'valibot';
import { emptyInput, orderDoesntExist } from '../errors';
import { resourceMissing } from '@wae/core';

export const createInvoiceInputSchema = v.pick(invoiceInputSchema, ['orderId']);

export const createInvoiceReturnSchema = invoiceSchema;

type CreateInvoiceOutput = v.InferOutput<typeof createInvoiceInputSchema>;
type CreateInvoiceReturnOutput = v.InferOutput<
   typeof createInvoiceReturnSchema
>;

export async function createInvoices(
   input: CreateInvoiceOutput[],
): Promise<CreateInvoiceReturnOutput[]> {
   const orders = await db
      .select()
      .from(ordersTable)
      .where(
         inArray(
            ordersTable.id,
            input.map(({ orderId }) => orderId),
         ),
      );

   const ordersIds = orders.map((order) => order.id);

   for (const { orderId } of input) {
      if (!ordersIds.includes(orderId)) {
         throw resourceMissing(`Order with id=${orderId} does not exist.`);
      }
   }

   const invoices = await db.insert(invoicesTable).values(input).returning();

   return invoices;
}
