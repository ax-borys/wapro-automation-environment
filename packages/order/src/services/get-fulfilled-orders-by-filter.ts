import { db } from '@wae/db';
import {
   customerSchema,
   invoiceSchema,
   orderSchema,
   receiptSchema,
   recipientSchema,
} from '@wae/types';
import * as v from 'valibot';

export const getFulfilledOrdersByFilterInputSchema = v.object({
   dateRange: v.nullish(
      v.object({
         from: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
         to: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
      }),
   ),
});

const fullOrderDataSchema = v.object({
   ...orderSchema.entries,
   customer: customerSchema,
   recipient: recipientSchema,
   receipt: v.nullish(receiptSchema),
   invoice: v.nullish(invoiceSchema),
});

export const getFulfilledOrdersByFilterReturnSchema =
   v.array(fullOrderDataSchema);

type GetOrderByFilterInput = v.InferOutput<
   typeof getFulfilledOrdersByFilterInputSchema
>;

export type GetFulfilledOrdersByFilterReturnOutput = v.InferOutput<
   typeof getFulfilledOrdersByFilterReturnSchema
>;

export async function getFulfilledOrdersByFilter({
   dateRange,
}: GetOrderByFilterInput): Promise<GetFulfilledOrdersByFilterReturnOutput> {
   const range: any = {};

   if (dateRange?.from) {
      range.gte = new Date(dateRange.from);
   }

   if (dateRange?.to) {
      range.lte = new Date(dateRange.to);
   }

   const orders = await db.query.ordersTable.findMany({
      with: {
         receipt: true,
         invoice: true,
         recipient: true,
         customer: true,
      },
      where: {
         createdAt: {
            ...range,
            isNotNull: true,
         },
         fulfilledAt: { isNotNull: true },
      },
   });

   console.log('Asserting...');

   for (const order of orders) {
      try {
         v.assert(fullOrderDataSchema, order);
      } catch (error) {
         console.log('Invalid order: ', order);
         throw error;
      }
   }

   v.assert(getFulfilledOrdersByFilterReturnSchema, orders);

   console.log('Assertion completed.');

   return orders;
}
