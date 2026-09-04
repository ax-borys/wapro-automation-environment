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
   OrderPoisitionInput,
   orderPositionInputSchema,
   orderPositionSchema,
   orderSchema,
} from '@wae/types';
import {
   addressesTable,
   customersTable,
   db,
   offersTable,
   ordersTable,
   positionsTable,
} from '@wae/db';
import { obtainCustomers } from './obtain-customers';
import { inArray } from 'drizzle-orm';

export const addOrderInputSchema = v.object({
   ...v.omit(orderInputSchema, ['createdAt', 'customerId', 'id']).entries,
   preparedAt: v.optional(
      v.nullable(
         v.union([
            v.pipe(
               v.string(),
               v.isoTimestamp(),
               v.transform((v) => new Date(v)),
            ),
            v.pipe(v.date()),
         ]),
      ),
   ),
   fulfilledAt: v.optional(
      v.nullable(
         v.union([
            v.pipe(
               v.string(),
               v.isoTimestamp(),
               v.transform((v) => new Date(v)),
            ),
            v.pipe(v.date()),
         ]),
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
               'offerId',
            ]).entries,
            externalOfferId: offerInputSchema.entries.externalId,
         }),
      ),
      v.nonEmpty(),
   ),
});

export const addOrderReturnSchema = v.object({
   ...v.omit(orderSchema, ['fulfilledAt']).entries,
   customer: customerSchema,
   address: addressSchema,
   items: v.array(
      v.object({
         ...orderPositionSchema.entries,
         offer: offerSchema,
      }),
   ),
   preparedAt: v.union([
      v.pipe(
         v.string(),
         v.isoTimestamp(),
         v.transform((v) => new Date(v)),
      ),
      v.pipe(v.date()),
   ]),
   createdAt: v.union([
      v.pipe(
         v.string(),
         v.isoTimestamp(),
         v.transform((v) => new Date(v)),
      ),
      v.pipe(v.date()),
   ]),
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
         items: e.items.map((j) => ({ ...j, clientTag: String(i) })),
      }),
   );

   const result = await db.transaction(async (tx) => {
      const customersInput = [...inputMap.values()].map((i) => i.customer);
      const customers = await obtainCustomers(tx, customersInput);

      const ordersInput = [...inputMap.values()].map((i) => ({
         ...i,
         customerId: v.parse(
            customerSchema,
            customers.find((c) => c.clientTag === i.clientTag),
         ).id,
      }));

      const existingOrders = await tx.select().from(ordersTable);
      const existingOrdersExternalIds = new Map(
         existingOrders.map((i) => [i.externalId, i.src]),
      );

      const nonExistingOrdersInput = ordersInput.filter(
         (order) =>
            !existingOrdersExternalIds.has(order.externalId) &&
            existingOrdersExternalIds.get(order.externalId) !== order.src,
      );

      const orders = await tx
         .insert(ordersTable)
         .values(nonExistingOrdersInput)
         .returning();

      console.log('Validation orders...');
      const validatedOrders = v.parse(v.array(orderSchema), orders);
      console.log('Validation completed.');

      const addressesInput = [...inputMap.values()].map((i) => ({
         ...i.address,
         customerId: v.parse(
            customerSchema,
            customers.find((c) => c.clientTag === i.clientTag),
         ).id,
         orderId: v.parse(
            orderSchema,
            orders.find((o) => o.externalId === i.externalId),
         ).id,
      }));

      const addresses = await tx
         .insert(addressesTable)
         .values(addressesInput)
         .returning();
      console.log('Addresses: ', addresses);

      const externalOffersIds = new Set(
         input.flatMap((i) => i.items.map((i) => i.externalOfferId)),
      );
      const offers = await tx
         .select()
         .from(offersTable)
         .where(inArray(offersTable.externalId, [...externalOffersIds]));

      if (externalOffersIds.size > offers.length) {
         throw new Error('Offers are not synchronized');
      }

      const items: Record<Order['id'], AddOrderReturnOutput['items']> = {};

      validatedOrders.forEach((order) => {
         const inputOrderItems = v.parse(
            v.object({
               ...addOrderInputSchema.entries,
               preparedAt: v.optional(v.nullable(v.date())),
               fulfilledAt: v.optional(v.nullable(v.date())),
            }),
            [...inputMap.values()].find((i) => i.clientTag === order.clientTag),
         ).items;

         console.log('Mapping orderItems...');
         const orderItems: AddOrderReturnOutput['items'] = inputOrderItems.map(
            (i) => ({
               offerId: v.parse(
                  offerSchema,
                  offers.find(
                     (offer) => offer.externalId === i.externalOfferId,
                  ),
               ).id,
               clientTag: null,
               offer: v.parse(
                  offerSchema,
                  offers.find(
                     (offer) => offer.externalId === i.externalOfferId,
                  ),
               ),
               orderId: order.id,
               price: i.price,
               quantity: i.quantity,
               receiptId: null,
            }),
         );
         console.log('Mapping completed.');

         items[order.id] = orderItems;
      });

      const positionsInput: OrderPoisitionInput[] = Object.keys(items).flatMap(
         (orderId) => {
            const orderPositionsInput: OrderPoisitionInput[] = items[
               Number(orderId)
            ].map((item): OrderPoisitionInput => {
               const position: OrderPoisitionInput = {
                  offerId: item.offerId,
                  orderId: Number(orderId),
                  price: item.price,
                  quantity: item.quantity,
               };

               return position;
            });
            return orderPositionsInput;
         },
      );

      console.log('Validatig positions input...');
      const validatedPositionsInput = v.parse(
         v.array(orderPositionInputSchema),
         positionsInput,
      );
      console.log('Validation completed');

      const positions = await tx
         .insert(positionsTable)
         .values(validatedPositionsInput);

      console.log('Positions: ', positions);

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
