import {
   WaproConfig,
   Mapping,
   orderWithPositionsWithOfferSchema,
} from '@wae/types';
import { dbWapro, recordReceipt, RecordReceiptOutput } from '@wae/wapro';
import * as v from 'valibot';
import { db, positionsTable, productsTable, receiptsTable } from '@wae/db';
import { createInsertSchema } from 'drizzle-orm/valibot';
import { orderDoesntExist, positionHasNoMatchedOffer } from '../errors';
import { GenerateReceiptInput } from '../schema';
import { generateReceipts } from './generate-receipts';
import {
   SaveReceiptInput,
   saveReceiptInputSchema,
   saveReceiptOutputSchema,
   SaveReceiptReturnOutput,
   saveReceipts,
} from './save-receipts';
import currency from 'currency.js';

const receiptInputSchema = createInsertSchema(receiptsTable);

export const createReceiptInputSchema = v.object({
   ...v.omit(saveReceiptInputSchema, ['number', 'fiscalNumber', 'positions'])
      .entries,
   fiscalNumber: v.nonNullish(receiptInputSchema.entries.fiscalNumber),
});

export const createReceiptsInputSchema = v.array(createReceiptInputSchema);

export const createReceiptOutputSchema = saveReceiptOutputSchema;

export type CreateReceiptInput = v.InferOutput<typeof createReceiptInputSchema>;
export type CreateReceiptReturnOutput = SaveReceiptReturnOutput;

export async function createReceipts(
   receiptsInput: CreateReceiptInput[],
   config: WaproConfig,
): Promise<CreateReceiptReturnOutput[]> {
   const orders = await db.query.ordersTable.findMany({
      with: {
         positions: {
            with: {
               offer: {
                  with: {
                     items: {
                        with: {
                           product: true,
                        },
                     },
                  },
               },
            },
         },
      },
      where: {
         id: {
            in: receiptsInput.map((receipt) => receipt.orderId),
         },
      },
   });

   const mappedOrders = new Map(orders.map((order) => [order.id, order]));

   // check whether each receipt input has created order
   for (const receipt of receiptsInput) {
      const order = mappedOrders.get(receipt.orderId);

      if (!order) {
         throw orderDoesntExist(receipt.orderId);
      }
   }

   const taggedReceiptsInput: (CreateReceiptInput & { clientTag: string })[] =
      receiptsInput.map((receipt, i) => ({ ...receipt, clientTag: String(i) }));

   const generateReceiptsInput: GenerateReceiptInput[] =
      taggedReceiptsInput.map((receipt) => {
         const order = v.parse(
            orderWithPositionsWithOfferSchema,
            mappedOrders.get(receipt.orderId),
         );

         return {
            id: Number(receipt.clientTag),
            paymentMethod: order.paymentMethod,
            items: order.positions.map((position) => ({
               offerId: String(position.offer.id),
               price: currency(position.price, { fromCents: true }).value,
               quantity: position.quantity,
            })),
            total: currency(order.totalToPay, { fromCents: true }).value,
         };
      });

   const itemsWithDuplicates = orders.flatMap((order) =>
      order.positions.flatMap((position) => position.offer.items),
   );

   const items = [
      ...new Set(itemsWithDuplicates.map((item) => JSON.stringify(item))),
   ].map((item) => JSON.parse(item) as (typeof itemsWithDuplicates)[number]);

   const generateReceiptsMap: Mapping = {};

   items.forEach((item) => {
      const record = generateReceiptsMap[item.offerId];
      const data: Mapping[string]['products'][number] = {
         quantity: item.quantity,
         sid: Number(item.product.externalId),
         vat: String(item.product.tax) as '0' | '8' | '23',
      };

      if (record) {
         record.products.push(data);
      } else {
         generateReceiptsMap[item.offerId] = {
            offerName: item.product.name,
            products: [data],
         };
      }
   });

   const generatedReceipts = generateReceipts(
      generateReceiptsInput,
      generateReceiptsMap,
      config,
   );

   const savedReceipts = await db.transaction(async (tx) => {
      return await dbWapro.transaction(async (tx2) => {
         const receiptsInfo: Record<number, RecordReceiptOutput> = {};

         for (const generatedReceipt of generatedReceipts) {
            const result = await recordReceipt(tx2, generatedReceipt);
            receiptsInfo[result.id] = result;
         }

         const saveReceiptsInput: SaveReceiptInput[] = taggedReceiptsInput.map(
            (receipt) => {
               return {
                  ...receipt,
                  number: receiptsInfo[Number(receipt.clientTag)].receiptNumber,
                  positions: v
                     .parse(
                        orderWithPositionsWithOfferSchema,
                        mappedOrders.get(receipt.orderId),
                     )
                     .positions.map((position) => ({
                        offerId: position.offerId,
                     })),
               };
            },
         );

         return await saveReceipts(tx, saveReceiptsInput);
      });
   });

   return savedReceipts;
}
