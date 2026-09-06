import { positionsTable, receiptsTable } from '@wae/db';
import * as v from 'valibot';
import { positionWasNotInitialized } from '../errors';
import {
   Position,
   positionInputSchema,
   positionSchema,
   receiptInputSchema,
   receiptSchema,
   Tx,
} from '@wae/types';
import { and, eq, or } from 'drizzle-orm';

export const saveReceiptInputSchema = v.object({
   ...v.omit(receiptInputSchema, ['id', 'createdAt', 'clientTag']).entries,
   positions: v.pipe(
      v.array(
         v.object({
            ...v.omit(positionInputSchema, [
               'receiptId',
               'price',
               'clientTag',
               'quantity',
               'orderId',
            ]).entries,
         }),
      ),
      v.nonEmpty(),
   ),
});

export const saveReceiptOutputSchema = v.object({
   ...receiptSchema.entries,
   positions: v.array(
      v.object({
         ...positionSchema.entries,
         receiptId: receiptSchema.entries.id,
      }),
   ),
});

export type SaveReceiptInput = v.InferInput<typeof saveReceiptInputSchema>;
export type SaveReceiptReturnInput = v.InferInput<
   typeof saveReceiptOutputSchema
>;
export type SaveReceiptReturnOutput = v.InferOutput<
   typeof saveReceiptOutputSchema
>;

export async function saveReceipts(
   tx: Tx,
   receiptsInput: SaveReceiptInput[],
): Promise<SaveReceiptReturnOutput[]> {
   return await tx.transaction(async () => {
      const taggedInput: (Omit<SaveReceiptInput, 'positions'> & {
         clientTag: string;
         positions: (SaveReceiptInput['positions'][number] & {
            clientTag: string;
         })[];
      })[] = receiptsInput.map((receipt, i) => ({
         ...receipt,
         clientTag: String(i),
         positions: receipt.positions.map((position) => ({
            ...position,
            clientTag: String(i),
         })),
      }));

      const receipts = await tx
         .insert(receiptsTable)
         .values(taggedInput)
         .returning();

      const mappedReceipts = new Map(
         receipts.map((receipt) => [receipt.clientTag, receipt]),
      );

      const positionsCondition = or(
         ...taggedInput.flatMap((receipt) =>
            receipt.positions.map((position) =>
               and(
                  eq(positionsTable.orderId, receipt.orderId),
                  eq(positionsTable.offerId, position.offerId),
               ),
            ),
         ),
      );

      const positions = await tx
         .select()
         .from(positionsTable)
         .where(positionsCondition);

      const key = (key1: string | number, key2: string | number) =>
         String(key1) + String(key2);

      const mappedPositions = new Map(
         positions.map((i) => [key(i.orderId, i.offerId), i]),
      );

      const updatedPositions: Position[] = [];
      for (const taggedPosition of taggedInput.flatMap((i) => i.positions)) {
         const receipt = v.parse(
            receiptSchema,
            mappedReceipts.get(taggedPosition.clientTag),
         );

         const position = mappedPositions.get(
            key(receipt.orderId, taggedPosition.offerId),
         );

         if (!position) {
            throw positionWasNotInitialized(
               receipt.orderId,
               taggedPosition.offerId,
            );
         }

         const [updatedPosition] = await tx
            .update(positionsTable)
            .set({ receiptId: receipt.id })
            .returning();

         updatedPositions.push(updatedPosition);
      }

      const result = receipts.map((receipt) => ({
         ...receipt,
         positions: updatedPositions.filter(
            (position) => position.clientTag === receipt.clientTag,
         ),
      }));

      const validatedResult = v.parse(v.array(saveReceiptOutputSchema), result);

      return validatedResult;
   });
}
