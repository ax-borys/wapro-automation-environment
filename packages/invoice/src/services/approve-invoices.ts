import { invoiceInputSchema, invoiceSchema, Tx } from '@wae/types';
import * as v from 'valibot';
import * as wapro from '@wae/wapro';
import { businessRuleViolation } from '@wae/error';
import { createInvoices } from './create-invoices';

export const approveInvoiceInputSchema = v.pick(invoiceInputSchema, [
   'number',
   'orderId',
]);

type ApproveInvoiceInput = v.InferOutput<typeof approveInvoiceInputSchema>;

type ApproveInvoiceReturnOutput = v.InferOutput<typeof invoiceSchema>;

export async function approveInvoices(
   tx: Tx,
   invoicesInput: ApproveInvoiceInput[],
): Promise<ApproveInvoiceReturnOutput[]> {
   //check whether each invoice exists in wapro as document with provided number
   for (const { number } of invoicesInput) {
      const exists = await wapro.hasOrderWithNumber({ number });

      if (!exists) {
         throw businessRuleViolation(
            `Document type FV with number=${number} does not exist in wapro database.`,
         );
      }
   }

   const invoices = await createInvoices(tx, invoicesInput);

   return invoices;
}
