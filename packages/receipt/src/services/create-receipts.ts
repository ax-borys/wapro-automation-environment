import { WaproConfig, Mapping, Tx, offerInputSchema } from '@wae/types';
import { dbWapro, recordReceipt, RecordReceiptOutput } from '@wae/wapro';
import * as v from 'valibot';
import { db, positionsTable, productsTable, receiptsTable } from '@wae/db';
import { createInsertSchema } from 'drizzle-orm/valibot';
import { positionHasNoMatchedOffer } from '../errors';
import { GenerateReceiptInput } from '../schema';
import { generateReceipts } from './generate-receipts';
import {
   SaveReceiptInput,
   saveReceiptInputSchema,
   SaveReceiptOutput,
   saveReceiptOutputSchema,
   saveReceipts,
} from './save-receipts';

const receiptInputSchema = createInsertSchema(receiptsTable);
const positionInputSchema = createInsertSchema(positionsTable);
const productInputSchema = createInsertSchema(productsTable);

export const createReceiptInputSchema = v.object({
   ...v.omit(saveReceiptInputSchema, [
      'id',
      'number',
      'clientTag',
      'fiscalNumber',
      'paymentMethod',
   ]).entries,
   fiscalNumber: v.nonNullish(receiptInputSchema.entries.fiscalNumber),
   paymentMethod: v.picklist(['PREPAID', 'POSTPAID']),
   positions: v.array(
      v.object({
         ...v.omit(saveReceiptInputSchema.entries.positions.item, [
            'offerId',
            'clientTag',
         ]).entries,
         externalId: v.nonNullish(
            v.pick(offerInputSchema, ['externalId']).entries.externalId,
         ),
         title: v.pick(offerInputSchema, ['title']).entries.title,
      }),
   ),
   createdAt: v.pipe(
      v.string(),
      v.isoTimestamp(),
      v.transform((v) => new Date(v)),
      v.instance(Date),
   ),
});

export const createReceiptsInputSchema = v.array(createReceiptInputSchema);

export const createReceiptOutputSchema = saveReceiptOutputSchema;

export type CreateReceiptInput = v.InferOutput<typeof createReceiptInputSchema>;
export type CreateReceiptOutput = SaveReceiptOutput;

export async function createReceipts(
   receipts: CreateReceiptInput[],
   config: WaproConfig,
): Promise<CreateReceiptOutput[]> {
   return await db.transaction(async (tx) => {
      const items = await tx.query.itemsTable.findMany({
         with: {
            offer: true,
            product: true,
         },
         where: {
            offer: {
               externalId: {
                  in: receipts.flatMap((receipt) =>
                     receipt.positions.map((position) => position.externalId),
                  ),
               },
            },
         },
      });

      const offers = items
         .map((item) => item.offer)
         .filter(
            (offer, i, arr) => !arr.slice(0, i).find((o) => o.id === offer.id),
         );

      // Check whether every position in each receipt has offerId referencing to offer.id in DB

      const positions = receipts.flatMap((receipt) => receipt.positions);

      for (const position of positions) {
         const isMapped = offers
            .map((offer) => offer.externalId)
            .includes(position.externalId);

         if (!isMapped) {
            throw positionHasNoMatchedOffer(
               position.externalId,
               position.title,
            );
         }
      }

      const map: Mapping = {};

      offers.forEach(
         (offer) =>
            (map[offer.externalId as NonNullable<typeof offer.externalId>] = {
               offerName: offer.title,
               products: items
                  .filter((item) => item.offerId === offer.id)
                  .map((item) => ({
                     sid: item.productId,
                     quantity: item.quantity,
                     vat: item.product.tax.toString() as '0' | '8' | '23',
                  })),
            }),
      );

      const taggedReceipts = receipts.map((r, i) => ({ id: i, ...r }));

      const generateReceiptsInput: GenerateReceiptInput[] = taggedReceipts.map(
         (receipt) => ({
            id: receipt.id,
            paymentMethod: receipt.paymentMethod,
            items: receipt.positions.map((position) => ({
               offerId: position.externalId,
               price: position.price,
               quantity: position.quantity,
            })),
            total: receipt.totalPaid,
         }),
      );

      const generatedReceipts = generateReceipts(
         generateReceiptsInput,
         map,
         config,
      );

      const savedReceipts = await dbWapro.transaction(async (tx2) => {
         const receiptsInfo: Record<number, RecordReceiptOutput> = {};

         for (const generatedReceipt of generatedReceipts) {
            const result = await recordReceipt(tx2, generatedReceipt);
            receiptsInfo[result.id] = result;
         }

         const saveReceiptsInput: SaveReceiptInput[] = taggedReceipts.map(
            (receipt) => {
               return {
                  ...receipt,
                  id: undefined,
                  number: receiptsInfo[receipt.id].receiptNumber,
                  orderId: receipt.orderId,
                  positions: receipt.positions.map((position) => ({
                     ...position,
                     offerId: offers.find(
                        (offer) => offer.externalId === position.externalId,
                     )!.id,
                  })),
               };
            },
         );

         return await saveReceipts(tx, saveReceiptsInput);
      });

      return savedReceipts;
   });
}
