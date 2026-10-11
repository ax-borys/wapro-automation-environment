import { db, invoicesTable, ordersTable } from '@wae/db';
import { invalidReference } from '@wae/error';
import { invoiceInputSchema, invoiceSchema, Tx } from '@wae/types';
import { inArray } from 'drizzle-orm';
import * as v from 'valibot';

export const createInvoiceInputSchema = v.pick(invoiceInputSchema, [
   'orderId',
   'number',
]);

export const createInvoiceReturnSchema = invoiceSchema;

type CreateInvoiceOutput = v.InferOutput<typeof createInvoiceInputSchema>;
type CreateInvoiceReturnOutput = v.InferOutput<
   typeof createInvoiceReturnSchema
>;

export async function createInvoices(
   tx: Tx,
   input: CreateInvoiceOutput[],
): Promise<CreateInvoiceReturnOutput[]> {
   const orders = await tx
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
         throw invalidReference(`Order with id=${orderId} does not exist.`);
      }
   }

   const invoices = await tx.insert(invoicesTable).values(input).returning();

   return invoices;
}
