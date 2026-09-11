import { Hono } from 'hono';
import * as allegro from '@wae/allegro';
import {
   ApiResponse,
   Offer,
   orderWithPositionsWithOfferSchema,
   Product,
   ReceiptPosition,
} from '@wae/types';
import { customAlphabet } from 'nanoid';
import {
   addOrderInputSchema,
   addOrders,
   obtainDeliveries,
   obtainOrders,
   obtainRecipients,
} from '@wae/order';
import * as v from 'valibot';
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

      console.log("Obtaining customers' addresses...");
      const customerAddresses = await obtainAddresses(
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
         allegroOrders.map((order) => order.recipient.address),
      );
      console.log('Obtaining succeeded.');

      console.log('Obtaining recipients...');
      const recipients = await obtainRecipients(
         allegroOrders.map((order) => {
            const recipientAddress = recipientAddresses.find(
               (address) => address.clientTag === order.clientTag,
            );

            if (!recipientAddress) {
               throw new Error('Failed to obtain recipient address.');
            }

            return { ...order.recipient, addressId: recipientAddress.id };
         }),
      );
      console.log('Obtaining succeeded.');

      console.log("Obtaining deliveries' addresses...");
      const deliveryAddresses = await obtainAddresses(
         allegroOrders.map((order) => order.delivery.address),
      );
      console.log('Obtaining succeeded.');

      console.log('Obtaining deliveries...');
      const deliveries = await obtainDeliveries(
         allegroOrders.map((order) => {
            const deliveryAddress = deliveryAddresses.find(
               (address) => address.clientTag === order.clientTag,
            );

            if (!deliveryAddress) {
               throw new Error('Failed to obtain delivery address.');
            }

            return { ...order.delivery, addressId: deliveryAddress.id };
         }),
      );
      console.log('Obtaining succeeded.');

      console.log('Obtaining orders...');
      const orders = await obtainOrders(
         allegroOrders.map((order) => {
            const customer = customers.find(
               (customer) => customer.clientTag === order.clientTag,
            );
            if (!customer) throw new Error('Failed to obtain customer.');
            const recipient = recipients.find(
               (recipient) => recipient.clientTag === order.clientTag,
            );
            if (!recipient) throw new Error('Failed to obtain recipient.');
            const delivery = deliveries.find(
               (delivery) => delivery.clientTag === order.clientTag,
            );
            if (!delivery) throw new Error('Failed to obtain delivery.');

            return {
               ...order,
               customerId: customer.id,
               recepientId: recipient.id,
               deliveryId: delivery.id,
            };
         }),
      );

      const completeOrders = orders.map((order) => {
         const customer = customers.find(
            (customer) => customer.id === order.customerId,
         );

         if (!customer) {
            throw new Error('Failed to obtain customer.');
         }

         const customerAddress = customerAddresses.find(
            (address) => address.id === customer.addressId,
         );

         const delivery = deliveries.find(
            (delivery) => delivery.id === order.deliveryId,
         );

         if (!delivery) {
            throw new Error('Failed to obtain delivery.');
         }

         const deliveryAddress = deliveryAddresses.find(
            (address) => address.id === delivery.addressId,
         );

         if (!deliveryAddress) {
            throw new Error('Failed to obtain delivery address');
         }

         return {
            ...order,
            customer: { ...customer, address: customerAddress },
            delivery: {
               ...delivery,
               address: deliveryAddress,
            },
         };
      });

      console.log('Obtaining succeeded.');

      return c.json<ApiResponse<typeof completeOrders>>({
         data: completeOrders,
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
