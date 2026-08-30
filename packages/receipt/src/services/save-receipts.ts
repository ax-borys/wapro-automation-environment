import { positionsTable, receiptsTable } from '@wae/db';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { offerDoesntExist } from '../errors';
import { Tx } from '@wae/types';
import currency from 'currency.js';

const receiptInputSchema = createInsertSchema(receiptsTable);
const positionInputSchema = createInsertSchema(positionsTable);
const receiptOutputSchema = createSelectSchema(receiptsTable);
const positionOutputSchema = createSelectSchema(positionsTable);

export const saveReceiptInputSchema = v.object({
   ...receiptInputSchema.entries,
   totalPaid: v.pipe(
      v.number(),
      v.minValue(0),
      v.check(
         (value) =>
            currency(value).intValue === currency(value).multiply(100).value,
         'Must be decimal with maximum 2 numbers after floating point',
      ),
   ),
   positions: v.array(
      v.object({
         ...v.omit(positionInputSchema, ['receiptId']).entries,
         price: v.pipe(
            v.number(),
            v.minValue(0),
            v.check(
               (value) =>
                  currency(value).intValue ===
                  currency(value).multiply(100).value,
               'Price must be a decimal with maximum 2 numbers after floating point.',
            ),
         ),
      }),
   ),
});

export const saveReceiptOutputSchema = v.object({
   ...receiptInputSchema.entries,
   positions: v.array(
      v.object({
         ...positionInputSchema.entries,
      }),
   ),
});

export type SaveReceiptInput = v.InferInput<typeof saveReceiptInputSchema>;
export type SaveReceiptOutput = v.InferOutput<typeof saveReceiptOutputSchema>;

export async function saveReceipts(
   tx: Tx,
   receiptsInput: SaveReceiptInput[],
): Promise<SaveReceiptOutput[]> {
   return await tx.transaction(async () => {
      const taggedReceiptsInput: SaveReceiptInput[] = receiptsInput.map(
         (r, i) => ({ ...r, clientTag: i.toString() }),
      );

      const taggedPositionsInput = taggedReceiptsInput.flatMap((ri) =>
         ri.positions.map((p) => ({ ...p, clientTag: ri.clientTag })),
      );

      const offers = await tx.query.offersTable.findMany({
         where: {
            id: {
               in: taggedPositionsInput.map((position) => position.offerId),
            },
         },
      });

      for (const position of receiptsInput.flatMap((ri) => ri.positions)) {
         const exists = offers
            .map((offer) => offer.id)
            .includes(position.offerId);

         if (!exists) {
            throw offerDoesntExist(position.offerId);
         }
      }

      const receipts = await tx
         .insert(receiptsTable)
         .values(
            taggedReceiptsInput.map((i) => ({
               ...i,
               totalPaid: currency(i.totalPaid).intValue,
            })),
         )
         .returning();

      const mappedReceiptsIds: Record<
         NonNullable<(typeof receipts)[number]['clientTag']>,
         (typeof receipts)[number]['id']
      > = {};

      for (const receipt of receipts) {
         mappedReceiptsIds[receipt.clientTag as string] = receipt.id;
      }

      const completePositionsInput = taggedPositionsInput.map((i) => ({
         ...i,
         price: currency(i.price).intValue,
         receiptId: mappedReceiptsIds[i.clientTag as string],
      }));

      const positions = await tx
         .insert(positionsTable)
         .values(completePositionsInput)
         .returning();

      const result = receipts.map((receipt) => ({
         ...receipt,
         positions: positions.filter(
            (position) => position.clientTag === receipt.clientTag,
         ),
      }));

      return result;
   });
}
