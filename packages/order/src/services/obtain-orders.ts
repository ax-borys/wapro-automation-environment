import { db, offersTable, ordersTable, positionsTable } from '@wae/db';
import { addOrderInputSchema, addOrderReturnSchema } from './add-orders';
import * as v from 'valibot';
import { and, eq, inArray, or } from 'drizzle-orm';
import { addressSchema, customerSchema, orderPositionSchema } from '@wae/types';
import { orderInputSchema } from '../types';

const obtainOrderInputSchema = addOrderInputSchema;
const obtainOrderReturnSchema = addOrderReturnSchema;

type ObtainOrderInput = v.InferOutput<typeof obtainOrderInputSchema>;
type ObtainOrderReturnInput = v.InferInput<typeof obtainOrderReturnSchema>;
type ObtainOrderReturnOutput = v.InferOutput<typeof obtainOrderReturnSchema>;

export async function obtainOrders(
   input: ObtainOrderInput[],
): Promise<ObtainOrderReturnOutput[]> {
   const existingOrders = await db.query.ordersTable.findMany({
      with: {
         customer: true,
         deliveryAddress: true,
         positions: true,
         receipt: true,
      },
   });

   const conditions = existingOrders.map((order) =>
      and(
         eq(positionsTable.orderId, order.id),
         inArray(
            positionsTable.offerId,
            order.positions.map((position) => position.id),
         ),
      ),
   );

   const positions = await db
      .select()
      .from(positionsTable)
      .where(or(...conditions));
   console.log(existingOrders);

   console.log('Validating existing orders...');
   const validatedExistingOrders = v.parse(
      v.array(obtainOrderReturnSchema),
      existingOrders.map(
         (order): ObtainOrderReturnInput => ({
            ...order,
            items: order.positions.map(
               (offer): ObtainOrderReturnInput['items'][number] => ({
                  clientTag: null,
                  offer: offer,
                  offerId: offer.id,
                  orderId: order.id,
                  price: v.parse(
                     orderPositionSchema,
                     positions.find(
                        (pos) =>
                           pos.offerId === offer.id && pos.orderId === order.id,
                     ),
                  ).price,
                  quantity: v.parse(
                     orderPositionSchema,
                     positions.find(
                        (pos) =>
                           pos.offerId === offer.id && pos.orderId === order.id,
                     ),
                  ).quantity,
                  receiptId: order.receipt?.id || null,
               }),
            ),
            status: 'READY_FOR_PROCESSING',
            paymentMethod: 'PREPAID',
            address: v.parse(addressSchema, order.deliveryAddress),
            customer: v.parse(customerSchema, order.customer),
            preparedAt: order.preparedAt || new Date(),
         }),
      ),
   );
   console.log('Validation completed.');

   return validatedExistingOrders;
}
