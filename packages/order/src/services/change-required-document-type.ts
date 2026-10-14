import { Order, orderSchema, Tx } from '@wae/types';
import * as v from 'valibot';
import { ordersTable } from '@wae/db';
import { eq } from 'drizzle-orm';
import { businessRuleViolation, invalidReference } from '@wae/error';

export const changeRequiredDocumentTypeInputSchema = v.object({
   orderId: orderSchema.entries.id,
   requiredDocumentType: orderSchema.entries.requiredDocumentType,
});

export async function changeRequiredDocumentType(
   tx: Tx,
   input: v.InferOutput<typeof changeRequiredDocumentTypeInputSchema>,
): Promise<Order> {
   const [order] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, input.orderId));

   if (!order) {
      throw invalidReference(
         `There is no order with such id: #${input.orderId}`,
      );
   }

   if (order.status === 'CANCELLED' || order.status === 'FULFILLED') {
      throw businessRuleViolation(
         'Order has been cancel or fulfilled. Changing required document type for those statuses are not allowed.',
      );
   }

   if (order.requiredDocumentType === input.requiredDocumentType) {
      return order;
   }

   const [updatedOrder] = await tx
      .update(ordersTable)
      .set({ requiredDocumentType: input.requiredDocumentType })
      .where(eq(ordersTable.id, input.orderId))
      .returning();

   return updatedOrder;
}
