import { receiptsTable } from '@wae/db';
import { receiptInputSchema, receiptSchema, Tx } from '@wae/types';
import { eq, textDecoder } from 'drizzle-orm';
import * as v from 'valibot';
import { errorOccured } from '../errors';

export const updateFiscalNumberInputSchema = v.object({
   id: v.nonNullish(v.pick(receiptInputSchema, ['id']).entries.id),
   fiscalNumber: v.pipe(
      v.pick(receiptInputSchema, ['fiscalNumber']).entries.fiscalNumber,
      v.minLength(1),
   ),
});

const updateFiscalNumberReturnSchema = v.omit(receiptSchema, ['clientTag']);

type UpdateFiscalNumberOutput = v.InferOutput<
   typeof updateFiscalNumberInputSchema
>;

type UpdateFiscalNumberReturnOutput = v.InferOutput<
   typeof updateFiscalNumberReturnSchema
>;

export async function updateFiscalNumber(
   tx: Tx,
   receiptInput: UpdateFiscalNumberOutput,
): Promise<UpdateFiscalNumberReturnOutput> {
   const receipt = await tx
      .select()
      .from(receiptsTable)
      .where(eq(receiptsTable.id, receiptInput.id));

   if (!receipt) {
      throw errorOccured(
         'NOT_FOUND',
         `Failed to update fiscal number. Receipt with id=${receiptInput.id} was not found.`,
      );
   }

   const [newReceipt] = await tx
      .update(receiptsTable)
      .set({ fiscalNumber: receiptInput.fiscalNumber })
      .where(eq(receiptsTable.id, receiptInput.id))
      .returning();

   v.assert(updateFiscalNumberReturnSchema, newReceipt);

   return newReceipt;
}
