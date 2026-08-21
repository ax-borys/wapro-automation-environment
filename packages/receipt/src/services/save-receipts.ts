import {
   db,
   itemsTable,
   offersTable,
   positionsTable,
   productsTable,
   receiptsTable,
} from '@wae/db';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-orm/valibot';
import * as v from 'valibot';
import { offerDoesntExist } from '../errors';

const receiptInputSchema = createInsertSchema(receiptsTable);
const positionInputSchema = createInsertSchema(positionsTable);

const saveReceiptInputSchema = v.object({
   ...receiptInputSchema.entries,
   positions: v.array(v.omit(positionInputSchema, ['receiptId'])),
});

type SaveReceiptInput = v.InferOutput<typeof saveReceiptInputSchema>;

export async function saveReceipts(
   receipts: SaveReceiptInput[],
): Promise<void> {
   await db.transaction(async (tx) => {
      for (const receipt of receipts) {
         const [{ id: receiptId }] = await tx
            .insert(receiptsTable)
            .values(receipt)
            .returning({ id: receiptsTable.id });

         for (const position of receipt.positions) {
            const [offerExists] = await tx
               .select()
               .from(offersTable)
               .where(eq(offersTable.id, position.offerId))
               .limit(1);

            if (!offerExists) {
               throw offerDoesntExist(position.offerId);
            }

            await tx.insert(positionsTable).values({ ...position, receiptId });
         }
      }
   });
}
