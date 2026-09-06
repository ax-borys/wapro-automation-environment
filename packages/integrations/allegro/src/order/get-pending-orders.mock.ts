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
               externalId: '2',
               src: 'http://localhost:8082/public/rtx5080.png',
            },
            quantity: 2,
            price: 650000,
         },
         {
            offer: {
               externalId: '3',
               src: 'http://localhost:8082/public/rtx5070.jpg',
            },
            quantity: 1,
            price: 450000,
         },
      ],
      externalId: 'order-2026-000125',
      src: 'allegro',
      status: 'READY_FOR_PROCESSING',
      totalToPay: 1750000,
      totalPaid: 1750000,
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
               externalId: '2',
               src: 'http://localhost:8082/public/rtx5080.png',
            },
            quantity: 2,
            price: 650000,
         },
         {
            offer: {
               externalId: '3',
               src: 'http://localhost:8082/public/rtx5070.jpg',
            },
            quantity: 1,
            price: 450000,
         },
      ],
      externalId: 'order-2026-000124',
      src: 'allegro',
      status: 'READY_FOR_PROCESSING',
      totalToPay: 1750000,
      totalPaid: 1750000,
      paymentMethod: 'PREPAID',
      packages: 1,
      fulfilledAt: null,
      preparedAt: new Date('2026-09-03T14:30:00Z'),
      createdAt: new Date('2026-09-01T09:15:00Z'),
   };

   return [order, order2];
}
