import * as v from 'valibot';
import {
   addressInputSchema,
   addressSchema,
   customerInputSchema,
   customerSchema,
   orderInputSchema,
   orderSchema,
} from '@wae/types';
import { addressesTable, customersTable, db, ordersTable } from '@wae/db';

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
});

export const addOrderOutputSchema = v.object({
   ...orderSchema.entries,
   customer: customerSchema,
   address: addressSchema,
});

type AddOrderInputSchema = v.InferOutput<typeof addOrderInputSchema>;
type AddOrderOutputSchema = v.InferOutput<typeof addOrderOutputSchema>;

export async function addOrders(
   input: AddOrderInputSchema[],
): Promise<AddOrderOutputSchema[]> {
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
      const customers = await tx
         .insert(customersTable)
         .values(customersInput)
         .returning();

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

      const completeOrders: AddOrderOutputSchema[] = validatedOrders.map(
         (order) => ({
            ...order,
            customer: v.parse(
               customerSchema,
               customers.find((c) => c.clientTag === order.clientTag),
            ),
            address: v.parse(
               addressSchema,
               addresses.find((c) => c.clientTag === order.clientTag),
            ),
         }),
      );

      return completeOrders;
   });

   return result;
}
