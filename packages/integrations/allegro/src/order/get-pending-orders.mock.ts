import * as v from 'valibot';
import { orderValidationSchema } from './get-pending-orders';

type Order = v.InferOutput<typeof orderValidationSchema>;

export async function getPendingOrdersMock(): Promise<Order[]> {
   const order: Order = {
      address: {
         postalCode: '00-950',
         street: 'Marszałkowska 12',
         countryCode: 'PL',
         city: 'Warsaw',
      },
      customer: {
         firstName: 'Anna',
         lastName: 'Kowalska',
         companyName: null,
         email: 'anna.kowalska@example.com',
         phoneNumber: '+48123456789',
         externalId: 'cust-10293',
      },
      positions: [
         {
            offer: {
               externalId: '1',
               src: 'allegro',
            },
            quantity: 1,
            price: 2500000,
         },
         {
            offer: {
               externalId: '2',
               src: 'allegro',
            },
            quantity: 2,
            price: 600000,
         },
         {
            offer: {
               externalId: 'delivery',
               src: 'allegro',
            },
            quantity: 1,
            price: 1000,
         },
      ],
      externalId: 'order-2026-000125',
      src: 'allegro',
      status: 'READY_FOR_PROCESSING',
      totalToPay: 2500000 + 2 * 600000 + 1000,
      totalPaid: 2500000 + 2 * 600000 + 1000,
      paymentMethod: 'PREPAID',
      packages: 1,
      fulfilledAt: null,
      preparedAt: new Date('2026-09-03T14:30:00Z'),
      createdAt: new Date('2026-09-01T09:15:00Z'),
   };

   const order2: Order = {
      address: {
         postalCode: '00-950',
         street: 'Marszałkowska 12',
         countryCode: 'PL',
         city: 'Warsaw',
      },
      customer: {
         firstName: 'Anna',
         lastName: 'Kowalska',
         companyName: null,
         email: 'anna.kowalska@example.com',
         phoneNumber: '+48123456789',
         externalId: 'cust-10293',
      },
      positions: [
         {
            offer: {
               externalId: '3',
               src: 'allegro',
            },
            quantity: 2,
            price: 450000,
         },
         {
            offer: {
               externalId: '4',
               src: 'allegro',
            },
            quantity: 1,
            price: 2000000,
         },
      ],
      externalId: 'order-2026-000124',
      src: 'allegro',
      status: 'READY_FOR_PROCESSING',
      totalToPay: 2 * 450000 + 2000000,
      totalPaid: 2 * 450000 + 2000000,
      paymentMethod: 'PREPAID',
      packages: 1,
      fulfilledAt: null,
      preparedAt: new Date('2026-09-03T14:30:00Z'),
      createdAt: new Date('2026-09-01T09:15:00Z'),
   };

   const order3: Order = {
      address: {
         postalCode: '00-950',
         street: 'Marszałkowska 12',
         countryCode: 'PL',
         city: 'Warsaw',
      },
      customer: {
         firstName: 'Anna',
         lastName: 'Kowalska',
         companyName: null,
         email: 'anna.kowalska@example.com',
         phoneNumber: '+48123456789',
         externalId: 'cust-10293',
      },
      positions: [
         {
            offer: {
               externalId: '2',
               src: 'allegro',
            },
            quantity: 2,
            price: 650000,
         },
         {
            offer: {
               externalId: '3',
               src: 'allegro',
            },
            quantity: 1,
            price: 450000,
         },
      ],
      externalId: 'order-2026-000126',
      src: 'allegro',
      status: 'READY_FOR_PROCESSING',
      totalToPay: 2 * 650000 + 450000,
      totalPaid: 2 * 650000 + 450000,
      paymentMethod: 'PREPAID',
      packages: 1,
      fulfilledAt: null,
      preparedAt: new Date('2026-09-03T14:30:00Z'),
      createdAt: new Date('2026-09-01T09:15:00Z'),
   };

   return [order, order2, order3];
}
