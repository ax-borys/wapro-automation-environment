import { ordersTable } from '@wae/db';
import { businessRuleViolation, invalidReference } from '@wae/error';
import { isCancellable } from '@wae/kernel';
import { Order, orderSchema, type Tx } from '@wae/types';
import { inArray } from 'drizzle-orm';
import * as v from 'valibot';

export const cancelOrdersInputSchema = v.pipe(
   v.array(orderSchema.entries.id),
   v.nonEmpty(),
);

type CancelOrdersInput = v.InferOutput<typeof cancelOrdersInputSchema>;

export async function cancelOrders(
   tx: Tx,
   input: CancelOrdersInput,
): Promise<Order[]> {
   const ids = [...new Set(input)];

   const orders = await tx
      .select()
      .from(ordersTable)
      .where(inArray(ordersTable.id, ids));

   const ordersById = new Map(orders.map((order) => [order.id, order]));

   for (const id of ids) {
      const order = ordersById.get(id);

      if (!order) {
         throw invalidReference(`Order with id=${id} does not exist`);
      }

      if (!isCancellable(order)) {
         throw businessRuleViolation(
            `Order with id=${order.id} is not cancellable.`,
         );
      }
   }

   const cancelledOrders = await tx
      .update(ordersTable)
      .set({ status: 'CANCELLED' })
      .where(inArray(ordersTable.id, ids))
      .returning();

   return cancelledOrders;
}
