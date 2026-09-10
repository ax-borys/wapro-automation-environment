import {
   addOrderInputSchema,
   addOrderReturnSchema,
   addOrders,
} from './add-orders';
import * as v from 'valibot';
import {
   buildSrcExternalIdQueryCondition,
   filterNewOrdersBySrcExternalId,
} from '../utils/filter-orders';
import { db } from '@wae/db';
import { Order, receiptSchema } from '@wae/types';

export const obtainOrderInputSchema = addOrderInputSchema;
export const obtainOrderReturnSchema = v.object({
   ...addOrderReturnSchema.entries,
   receipt: v.nullable(receiptSchema),
});

type ObtainOrderOutput = v.InferOutput<typeof obtainOrderInputSchema>;
type ObtainOrderReturnOutput = v.InferOutput<typeof obtainOrderReturnSchema>;

export async function obtainOrders(
   input: ObtainOrderOutput[],
): Promise<ObtainOrderReturnOutput[]> {
   const condition = buildSrcExternalIdQueryCondition(input);

   const existingOrders = await db.query.ordersTable.findMany({
      with: {
         positions: {
            with: {
               offer: true,
            },
         },
         receipt: true,
      },
      where: condition,
   });

   const newOrdersInput = filterNewOrdersBySrcExternalId(input, existingOrders);

   const newOrders: typeof existingOrders = [];

   if (newOrdersInput.length) {
      const orders = await addOrders(newOrdersInput);

      orders.forEach((order) => newOrders.push({ ...order, receipt: null }));
   }

   const orders = [...existingOrders, ...newOrders];

   const validatedOrders = v.parse(v.array(obtainOrderReturnSchema), orders);

   return validatedOrders;
}
