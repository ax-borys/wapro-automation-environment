import { db } from '@wae/db';
import { customerSchema, orderSchema, receiptSchema } from '@wae/types';
import * as v from 'valibot';

export const getReceiptsInputSchema = v.object({
   dateRange: v.nullish(
      v.object({
         from: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
         to: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
      }),
   ),
});

export const getReceiptsOutputSchema = v.object({
   ...receiptSchema.entries,
   order: v.object({ ...orderSchema.entries, customer: customerSchema }),
});

export type GetReceiptsInput = v.InferInput<typeof getReceiptsInputSchema>;
export type GetReceiptOutput = v.InferOutput<typeof getReceiptsOutputSchema>;

export async function getReceipts({
   dateRange,
}: GetReceiptsInput): Promise<GetReceiptOutput[]> {
   const range: any = {};

   if (dateRange?.from) {
      range.gte = new Date(dateRange.from);
   }

   if (dateRange?.to) {
      range.lte = new Date(dateRange.to);
   }

   const receipts = await db.query.receiptsTable.findMany({
      with: {
         order: {
            with: {
               customer: true,
            },
         },
      },
      where: {
         createdAt: {
            ...range,
            isNotNull: true,
         },
      },
   });

   const receiptsWithOrder = v.parse(
      v.array(getReceiptsOutputSchema),
      receipts,
   );

   return receiptsWithOrder;
}
