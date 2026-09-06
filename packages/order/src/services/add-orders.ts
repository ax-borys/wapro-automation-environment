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
   PositionInput,
   positionInputSchema,
   positionSchema,
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
import { nanoid } from 'nanoid';

export const addOrderInputSchema = v.object({
   ...v.omit(orderInputSchema, ['createdAt', 'customerId', 'id', 'clientTag'])
      .entries,
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
   customer: v.omit(customerInputSchema, ['id', 'clientTag']),
   address: v.omit(addressInputSchema, ['customerId', 'orderId', 'clientTag']),
   positions: v.pipe(
      v.array(
         v.object({
            ...v.omit(positionInputSchema, [
               'clientTag',
               'receiptId',
               'offerId',
               'orderId',
            ]).entries,
            offer: v.pick(offerInputSchema, ['externalId', 'src']),
         }),
      ),
      v.nonEmpty(),
   ),
});

export const addOrderReturnSchema = v.object({
   ...orderSchema.entries,
   customer: customerSchema,
   address: addressSchema,
   positions: v.pipe(
      v.array(
         v.object({
            ...positionSchema.entries,
            offer: offerSchema,
         }),
      ),
      v.nonEmpty(),
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
   fulfilledAt: v.nullable(
      v.union([
         v.pipe(
            v.string(),
            v.isoTimestamp(),
            v.transform((v) => new Date(v)),
         ),
         v.pipe(v.date()),
      ]),
   ),
});

type AddOrderInputSchema = v.InferOutput<typeof addOrderInputSchema>;
type AddOrderReturnInput = v.InferInput<typeof addOrderReturnSchema>;
type AddOrderReturnOutput = v.InferOutput<typeof addOrderReturnSchema>;

export async function addOrders(
   input: AddOrderInputSchema[],
): Promise<AddOrderReturnOutput[]> {
   const inputMap = new Map<
      string,
      Omit<AddOrderInputSchema, 'positions'> & {
         positions: (AddOrderInputSchema['positions'][number] & {
            clientTag: string;
         })[];
         address: { clientTag: string };
         clientTag: string;
      }
   >();

   input.forEach((e, i) =>
      inputMap.set(String(i), {
         ...e,
         clientTag: String(i),
         customer: {
            ...e.customer,
            externalId: e.customer.externalId ?? nanoid(),
         },
         address: { ...e.address, clientTag: String(i) },
         positions: e.positions.map((position) => ({
            ...position,
            clientTag: String(i),
         })),
      }),
   );

   const result = await db.transaction(async (tx) => {
      const customersInput = [...inputMap.values()].map((i) => i.customer);
      const customers = await obtainCustomers(tx, customersInput);

      const ordersInput = [...inputMap.values()].map((i) => ({
         ...i,
         customerId: v.parse(
            customerSchema,
            customers.find((c) => i.customer.externalId === c.externalId),
         ).id,
         preparedAt: i.preparedAt ?? new Date(),
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
            customers.find((c) => i.customer.externalId === c.externalId),
         ).id,
         orderId: v.parse(
            orderSchema,
            orders.find(
               (o) => o.externalId === i.externalId && o.src === i.src,
            ),
         ).id,
      }));

      const addresses = await tx
         .insert(addressesTable)
         .values(addressesInput)
         .returning();

      const externalOffersIds = new Set(
         input.flatMap((i) => i.positions.map((i) => i.offer.externalId)),
      );

      const offers = await tx
         .select()
         .from(offersTable)
         .where(inArray(offersTable.externalId, [...externalOffersIds]));

      if (externalOffersIds.size > offers.length) {
         throw new Error('Offers are not synchronized');
      }

      console.log(offers);
      console.log(orders);

      console.log('Building positions...');
      const positionsInput: PositionInput[] = [...inputMap.values()].flatMap(
         (order) =>
            order.positions.map(
               (position): PositionInput => ({
                  orderId: v.parse(
                     orderSchema,
                     orders.find((o) => o.clientTag === order.clientTag),
                  ).id,
                  offerId: v.parse(
                     offerSchema,
                     offers.find(
                        (o) =>
                           o.externalId === position.offer.externalId &&
                           o.src === 'curl',
                     ),
                  ).id,
                  price: position.price,
                  quantity: position.quantity,
                  clientTag: position.clientTag,
               }),
            ),
      );

      console.log('Validatig positions input...');
      const validatedPositionsInput = v.parse(
         v.array(orderPositionInputSchema),
         positionsInput,
      );
      console.log('Validation completed');

      const positions = await tx
         .insert(positionsTable)
         .values(validatedPositionsInput)
         .returning();

      console.log('Positions: ', positions);

      const completeOrders: AddOrderReturnInput[] = validatedOrders.map(
         (order): AddOrderReturnInput => ({
            ...order,
            customer: v.parse(
               customerSchema,
               customers.find((c) => c.id === order.customerId),
            ),
            address: v.parse(
               addressSchema,
               addresses.find((a) => a.clientTag === order.clientTag),
            ),
            positions: positions
               .filter((p) => p.orderId === order.id)
               .map((p) => ({
                  ...p,
                  offer: v.parse(
                     offerSchema,
                     offers.find((offer) => offer.id === p.offerId),
                  ),
               })),
         }),
      );

      const validatedCompleteOrders = v.parse(
         v.array(addOrderReturnSchema),
         completeOrders,
      );

      return validatedCompleteOrders;
   });

   return result;
}
