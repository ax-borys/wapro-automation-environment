import { db, receiptsTable } from '@wae/db';
import { and, gte, lt, lte } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';

const receiptOutputSchema = createSelectSchema(receiptsTable);
export const getReceiptsInputSchema = v.object({
   dateRange: v.nullish(
      v.object({
         from: v.nullish(v.pipe(v.string(), v.isoDate())),
         to: v.nullish(v.pipe(v.string(), v.isoDate())),
      }),
   ),
});

export type GetReceiptsInput = v.InferInput<typeof getReceiptsInputSchema>;
export type GetReceiptOutput = v.InferOutput<typeof receiptOutputSchema>;

export async function getReceipts({
   dateRange,
}: GetReceiptsInput): Promise<GetReceiptOutput[]> {
   const conditions = [
      dateRange?.from
         ? gte(receiptsTable.createdAt, new Date(dateRange.from))
         : undefined,
      dateRange?.to
         ? lte(receiptsTable.createdAt, new Date(dateRange.to))
         : undefined,
   ];

   const receipts = await db
      .select()
      .from(receiptsTable)
      .where(and(...conditions));

   return receipts;
}
