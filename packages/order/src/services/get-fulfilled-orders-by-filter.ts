import { db } from '@wae/db';
import { fullOrderShema } from '@wae/types';
import * as v from 'valibot';

export const getFulfilledOrdersByFilterInputSchema = v.object({
   dateRange: v.nullish(
      v.object({
         from: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
         to: v.nullish(v.pipe(v.string(), v.isoTimestamp())),
      }),
   ),
});

const fullOrderDataSchema = fullOrderShema;

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
         recipient: { with: { address: true } },
         customer: { with: { address: true } },
         delivery: { with: { address: true } },
         positions: {
            with: { offer: { with: { items: { with: { product: true } } } } },
         },
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

   const validatedOrders = v.parse(
      getFulfilledOrdersByFilterReturnSchema,
      orders,
   );

   console.log('Assertion completed.');

   return validatedOrders;
}
