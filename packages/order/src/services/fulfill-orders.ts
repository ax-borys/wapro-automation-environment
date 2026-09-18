import * as v from 'valibot';
import { db, ordersTable } from '@wae/db';
import { inArray } from 'drizzle-orm';
import { businessRuleViolation } from '@wae/core';
import { Order, orderSchema } from '@wae/types';

export const fulfillOrderInputSchema = v.object({
   id: orderSchema.entries.id,
});

export const fulfillOrderReturnSchema = orderSchema;

type FulfillOrderOutput = v.InferOutput<typeof fulfillOrderInputSchema>;
type FulfillOrderReturnOutput = v.InferOutput<typeof fulfillOrderReturnSchema>;

export async function fulfillOrders(
   ordersInput: FulfillOrderOutput[],
): Promise<FulfillOrderReturnOutput[]> {
   const orders = await db
      .select()
      .from(ordersTable)
      .where(
         inArray(
            ordersTable.id,
            ordersInput.map((i) => i.id),
         ),
      );

   // ensure that each order from ordersInput exists
   ordersInput.forEach((orderInput) => {
      const order = orders.find((order) => orderInput.id === order.id);

      if (!order) {
         throw businessRuleViolation(
            `Order with id=${orderInput.id} doesn't exist.`,
         );
      }
   });

   const updateOrdersInput = ordersInput.filter((orderInput) => {
      const order = v.parse(
         orderSchema,
         orders.find((order) => orderInput.id === order.id),
      );

      return order.status !== 'FULFILLED' && order.status !== 'CANCELLED';
   });

   const updatedOrders = await db.transaction(async (tx) => {
      const orders = await tx
         .update(ordersTable)
         .set({ status: 'FULFILLED', fulfilledAt: new Date() })
         .where(
            inArray(
               ordersTable.id,
               updateOrdersInput.map((i) => i.id),
            ),
         )
         .returning();

      return orders;
   });

   const notUpdatedOrders = orders.filter(
      (order) => !updatedOrders.find((order2) => order.id === order2.id),
   );

   const result = [...notUpdatedOrders, ...updatedOrders];

   const validatedResult = v.parse(v.array(fulfillOrderReturnSchema), result);

   return validatedResult;
}
