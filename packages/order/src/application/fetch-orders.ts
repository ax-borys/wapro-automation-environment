import { FullOrder, fullOrderShema, orderSchema, Tx } from '@wae/types';
import * as v from 'valibot';

export const fetchOrdersFilterSchema = v.object({
   createdAtGte: v.optional(
      v.pipe(
         v.union([v.date(), v.string(), v.number()]),
         v.rawTransform(({ dataset, addIssue, NEVER }) => {
            const date = new Date(dataset.value);

            if (date.toString() === 'Invalid Date') {
               addIssue({
                  message: 'Invalid date format for createdAtGte field',
               });
               return NEVER;
            }

            return date;
         }),
         v.date(),
      ),
   ),
   status: v.optional(orderSchema.entries.status),
});

export type FetchOrdersFilterInput = v.InferInput<
   typeof fetchOrdersFilterSchema
>;
type FetchOrdersFilter = v.InferOutput<typeof fetchOrdersFilterSchema>;

export async function fetchOrders(
   tx: Tx,
   filter?: FetchOrdersFilter,
): Promise<FullOrder[]> {
   const orders = await tx.query.ordersTable.findMany({
      with: {
         customer: { with: { address: true } },
         recipient: { with: { address: true } },
         delivery: { with: { address: true } },
         positions: {
            with: { offer: { with: { items: { with: { product: true } } } } },
         },
         invoice: true,
         receipt: true,
      },
      where: {
         createdAt: {
            gte: filter?.createdAtGte ?? new Date(0),
         },
         ...(filter?.status && { status: filter?.status }),
      },
   });

   const validatedOrders = v.parse(v.array(fullOrderShema), orders);

   return validatedOrders;
}
