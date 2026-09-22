import { Hono } from 'hono';
import * as allegro from '@wae/allegro';
import * as v from 'valibot';
import {
   addressSchema,
   ApiResponse,
   customerSchema,
   deliverySchema,
   Offer,
   orderWithPositionsWithOfferSchema,
   Product,
   ReceiptPosition,
   recipientSchema,
} from '@wae/types';
import { customAlphabet } from 'nanoid';
import {
   addOrderInputSchema,
   addOrders,
   obtainDeliveries,
   obtainOrderInputSchema,
   obtainOrders,
   obtainRecipients,
} from '@wae/order';
import {
   addressesTable,
   customersTable,
   db,
   deliveriesTable,
   ordersTable,
   positionsTable,
   receiptsTable,
} from '@wae/db';
import { NotNull } from 'drizzle-orm';
import { obtainAddresses } from '@wae/address';
import { obtainCustomers } from '@wae/customer';

const generateId = customAlphabet('0123456789', 10);

async function wipeOrders() {
   await db.delete(positionsTable);
   await db.delete(receiptsTable);
   await db.delete(ordersTable);
   await db.delete(deliveriesTable);
   await db.delete(customersTable);
   await db.delete(addressesTable);
}
export const order = new Hono()
   .get('/orders/pending', async (c) => {
      console.log('Fetching allegro orders...');
      const allegroOrders = await allegro.getPendingOrders();
      console.log('Fetching succeeded.');

      if (!allegroOrders.length) {
         return c.json<ApiResponse<[]>>({
            data: [],
            error: null,
         });
      }
      const result = await db.transaction(async (tx) => {
         console.log("Obtaining customers' addresses...");
         const customerAddresses = await obtainAddresses(
            tx,
            allegroOrders
               .filter(
                  (
                     order,
                  ): order is typeof order & {
                     customer: typeof order.customer & {
                        address: NonNullable<typeof order.customer.address>;
                     };
                  } => order.customer.address !== null,
               )
               .map((order) => order.customer.address),
         );
         console.log('Obtaining succeeded.');

         console.log('Obtaining customers...');
         const customers = await obtainCustomers(
            tx,
            allegroOrders.map((order) => {
               const customerAddress = order.customer.address
                  ? customerAddresses.find(
                       (address) => address.clientTag === order.clientTag,
                    )
                  : null;

               return {
                  ...order.customer,
                  addressId: customerAddress ? customerAddress.id : null,
               };
            }),
         );
         console.log('Obtaining succeeded.');

         console.log("Obtaining recipients' addresses...");
         const recipientAddresses = await obtainAddresses(
            tx,
            allegroOrders.map((order) => order.recipient.address),
         );
         console.log('Obtaining succeeded.');

         console.log('Obtaining recipients...');
         const recipients = await obtainRecipients(
            tx,
            allegroOrders.map((order) => {
               const recipientAddress = v.parse(
                  addressSchema,
                  recipientAddresses.find(
                     (address) => address.clientTag === order.clientTag,
                  ),
               );

               return { ...order.recipient, addressId: recipientAddress.id };
            }),
         );
         console.log('Obtaining succeeded.');

         console.log("Obtaining deliveries' addresses...");
         const deliveryAddresses = await obtainAddresses(
            tx,
            allegroOrders.map((order) => order.delivery.address),
         );
         console.log('Obtaining succeeded.');

         console.log('Obtaining deliveries...');
         const deliveries = await obtainDeliveries(
            tx,
            allegroOrders.map((order) => {
               const deliveryAddress = v.parse(
                  addressSchema,
                  deliveryAddresses.find(
                     (address) => address.clientTag === order.clientTag,
                  ),
               );

               return { ...order.delivery, addressId: deliveryAddress.id };
            }),
         );
         console.log('Obtaining succeeded.');

         console.log('Obtaining orders...');
         const validatedObtainOrdersInput = v.parse(
            v.pipe(v.array(obtainOrderInputSchema), v.nonEmpty()),
            allegroOrders.map((order) => {
               const customer = v.parse(
                  customerSchema,
                  customers.find(
                     (customer) => customer.clientTag === order.clientTag,
                  ),
               );

               const recipient = v.parse(
                  recipientSchema,
                  recipients.find(
                     (recipient) => recipient.clientTag === order.clientTag,
                  ),
               );

               const delivery = v.parse(
                  deliverySchema,
                  deliveries.find(
                     (delivery) => delivery.clientTag === order.clientTag,
                  ),
               );

               return {
                  ...order,
                  customerId: customer.id,
                  recepientId: recipient.id,
                  deliveryId: delivery.id,
               };
            }),
         );

         const orders = await obtainOrders(tx, validatedObtainOrdersInput);

         const completeOrders = orders.map((order) => {
            const customer = v.parse(
               customerSchema,
               customers.find((customer) => customer.id === order.customerId),
            );

            const customerAddress = customerAddresses.find(
               (address) => address.id === customer.addressId,
            );

            const recipient = v.parse(
               recipientSchema,
               recipients.find(
                  (recipient) => recipient.id === order.recepientId,
               ),
            );

            const delivery = v.parse(
               deliverySchema,
               deliveries.find((delivery) => delivery.id === order.deliveryId),
            );

            const deliveryAddress = v.parse(
               addressSchema,
               deliveryAddresses.find(
                  (address) => address.id === delivery.addressId,
               ),
            );

            return {
               ...order,
               customer: { ...customer, address: customerAddress },
               recipient,
               delivery: {
                  ...delivery,
                  address: deliveryAddress,
               },
            };
         });

         console.log('Obtaining succeeded.');

         return completeOrders;
      });

      return c.json<ApiResponse<typeof result>>({
         data: result,
         error: null,
      });
   })
   .get('/mock/orders/peinding', async (c) => {
      const orders = [
         {
            id: 1001,
            customerId: 501,
            fulfilledAt: new Date('2025-01-15T14:30:00Z'),
            customer: {
               id: 501,
               firstName: 'Anna',
               lastName: 'Kowalska',
               companyName: null,
               email: 'anna.kowalska@example.com',
               phoneNumber: '+48123456789',
               externalId: 'cust_ext_501',
            },
            positions: [
               {
                  orderId: 1001,
                  offer: {
                     id: 1,
                     externalId: '1',
                     src: 'curl',
                     title: 'Geforce RTX 5090',
                     imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
                     approved: true,
                  },
                  quantity: 2,
                  price: 20000,
               },
               {
                  orderId: 1001,
                  offer: {
                     id: 2,
                     externalId: '2',
                     src: 'curl',
                     title: 'Geforce RTX 5080',
                     imgSrc: 'http://localhost:8082/public/rtx5080.png',
                     approved: true,
                  },
                  quantity: 1,
                  price: 6500,
               },
            ],
            externalId: 'order_ext_1001',
            src: 'shop_a',
            status: 'COMPLETED',
            totalToPay: 46500,
            totalPaid: 46500,
            paymentMethod: 'PREPAID' as const,
            deliveryAddress: {
               postalCode: '00-001',
               street: 'Marszałkowska 10',
               apartament: '4B',
               countryCode: 'PL',
               city: 'Warsaw',
            },
            packages: 1,
            preparedAt: new Date('2025-01-14T09:00:00Z'),
            createdAt: new Date('2025-01-12T10:15:00Z'),
         },
      ];

      return c.json<ApiResponse<typeof orders>>({
         data: orders,
         error: null,
      });
   });
