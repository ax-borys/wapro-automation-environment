import * as v from 'valibot';
import {
   addressInputSchema,
   addressSchema,
   customerInputSchema,
   customerSchema,
   offerInputSchema,
   offerSchema,
   Order,
   OrderInput,
   orderInputSchema,
   orderPositionSchema,
   orderSchema,
} from '@wae/types';
import {
   addressesTable,
   customersTable,
   db,
   offersTable,
   ordersTable,
} from '@wae/db';
import { obtainCustomers } from './obtain-customers';
import { inArray } from 'drizzle-orm';

export const addOrderInputSchema = v.object({
   ...v.omit(orderInputSchema, ['createdAt', 'customerId', 'id']).entries,
   preparedAt: v.optional(
      v.nullable(
         v.pipe(
            v.string(),
            v.isoTimestamp(),
            v.transform((v) => new Date(v)),
         ),
      ),
   ),
   fulfilledAt: v.optional(
      v.nullable(
         v.pipe(
            v.string(),
            v.isoTimestamp(),
            v.transform((v) => new Date(v)),
         ),
      ),
   ),
   customer: v.omit(customerInputSchema, ['id']),
   address: v.omit(addressInputSchema, ['customerId', 'orderId']),
   items: v.pipe(
      v.array(
         v.object({
            ...v.omit(orderPositionSchema, [
               'clientTag',
               'orderId',
               'receiptId',
            ]).entries,
         }),
      ),
      v.nonEmpty(),
   ),
});

export const addOrderReturnSchema = v.object({
   ...orderSchema.entries,
   customer: customerSchema,
   address: addressSchema,
   items: v.array(
      v.object({
         ...orderPositionSchema.entries,
         offer: offerSchema,
      }),
   ),
   fulfilledAt: v.null(),
   preparedAt: v.pipe(
      v.date(),
      v.transform((v) => v.toISOString()),
   ),
});

type AddOrderInputSchema = v.InferOutput<typeof addOrderInputSchema>;
type AddOrderReturnInput = v.InferInput<typeof addOrderReturnSchema>;
type AddOrderReturnOutput = v.InferOutput<typeof addOrderReturnSchema>;

export async function addOrders(
   input: AddOrderInputSchema[],
): Promise<AddOrderReturnOutput[]> {
   const inputMap = new Map<string, AddOrderInputSchema>();

   input.forEach((e, i) =>
      inputMap.set(String(i), {
         ...e,
         clientTag: String(i),
         customer: { ...e.customer, clientTag: String(i) },
         address: { ...e.address, clientTag: String(i) },
      }),
   );

   const result = await db.transaction(async (tx) => {
      const customersInput = [...inputMap.values()].map((i) => i.customer);
      const customers = await obtainCustomers(tx, customersInput);

      const addressesInput = [...inputMap.values()].map((i) => ({
         ...i.address,
         customerId: v.parse(
            customerSchema,
            customers.find((c) => c.clientTag === i.clientTag),
         ).id,
      }));

      const addresses = await tx
         .insert(addressesTable)
         .values(addressesInput)
         .returning();

      const ordersInput = [...inputMap.values()].map((i) => ({
         ...i,
         customerId: v.parse(
            customerSchema,
            customers.find((c) => c.clientTag === i.clientTag),
         ).id,
      }));

      const orders = await tx
         .insert(ordersTable)
         .values(ordersInput)
         .returning();

      const validatedOrders = v.parse(v.array(orderSchema), orders);

      const offersIds = input.flatMap((i) => i.items.map((i) => i.offerId));
      const offers = await tx
         .select()
         .from(offersTable)
         .where(inArray(offersTable.id, offersIds));

      const items: Record<Order['id'], AddOrderReturnOutput['items']> = {};

      validatedOrders.forEach((order) => {
         const inputOrderItems = v.parse(
            addOrderInputSchema,
            input.find((i) => i.clientTag === order.clientTag),
         ).items;

         const orderItems: AddOrderReturnOutput['items'] = inputOrderItems.map(
            (i) => ({
               offerId: i.offerId,
               clientTag: null,
               offer: v.parse(
                  offerSchema,
                  offers.find((offer) => offer.id === i.offerId),
               ),
               orderId: order.id,
               price: i.price,
               quantity: i.quantity,
               receiptId: null,
            }),
         );

         items[order.id] = orderItems;
      });

      const completeOrders = validatedOrders.map((order) => ({
         ...order,
         fulfilledAt: null,
         preparedAt: new Date(),
         customer: v.parse(
            customerSchema,
            customers.find((c) => c.clientTag === order.clientTag),
         ),
         address: v.parse(
            addressSchema,
            addresses.find((c) => c.clientTag === order.clientTag),
         ),
         items: items[order.id],
      }));

      const validatedCompleteOrders = v.parse(
         v.array(addOrderReturnSchema),
         completeOrders,
      );

      return validatedCompleteOrders;
   });

   return result;
}
