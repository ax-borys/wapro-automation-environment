import { Hono } from 'hono';
import * as allegro from '@wae/allegro';
import { ApiResponse, Offer, Product, ReceiptPosition } from '@wae/types';
import { getAllOffers } from '@wae/offer';
import { customAlphabet } from 'nanoid';
import { addOrderInputSchema, addOrders, obtainOrders } from '@wae/order';
import * as v from 'valibot';
import {
   addressesTable,
   customersTable,
   db,
   ordersTable,
   positionsTable,
   receiptsTable,
} from '@wae/db';

const generateId = customAlphabet('0123456789', 10);

export const order = new Hono()
   .get('/orders/pending', async (c) => {
      const allegroOrders = await allegro.getPendingOrders();

      console.log('Validating allegro-orders...');
      const validatedAllegroOrders = v.parse(
         v.array(addOrderInputSchema),
         allegroOrders.map((order) => ({
            ...order,
            items: order.positions.map((position) => ({
               ...position,
            })),
            preparedAt: order.preparedAt?.toISOString() || null,
            createdAt: order.createdAt?.toISOString() || null,
         })),
      );
      console.log('Validation completed.');

      await db.delete(addressesTable);
      await db.delete(positionsTable);
      await db.delete(receiptsTable);
      await db.delete(ordersTable);
      await db.delete(customersTable);

      const orders = await addOrders(validatedAllegroOrders);

      return c.json<ApiResponse<typeof orders>>({
         data: orders,
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
