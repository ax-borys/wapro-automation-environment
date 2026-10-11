import * as v from 'valibot';
import { mapOrder, orderValidationSchema } from '../mappers/map-order';
import { RawOrder } from '../types';
type Order = v.InferOutput<typeof orderValidationSchema>;

export async function getPendingOrdersMock(): Promise<Order[]> {
   const mockOrder: RawOrder = {
      id: '8f3c2a10-5b7e-11ef-9a3d-0242ac120003',

      buyer: {
         id: '12345678',
         email: 'jan.kowalski+abc123@allegromail.pl',
         login: 'jan_kowalski_88',
         firstName: 'Jan',
         lastName: 'Kowalski',
         companyName: null,
         guest: false,
         personalIdentity: null,
         phoneNumber: '+48501234567',
         address: {
            street: 'Marszałkowska 10/12',
            city: 'Warszawa',
            postCode: '00-590',
            countryCode: 'PL',
         },
      },

      payment: {
         type: 'ONLINE',
         paidAmount: {
            amount: '70010.99',
            currency: 'PLN',
         },
      },

      lineItems: [
         {
            id: 'li-0001',
            offer: {
               id: '1',
               name: 'Geforce RTX 5090 Super-puper not mined',
            },
            quantity: 2,
            price: { amount: '25000', currency: 'PLN' },
         },
         {
            id: 'li-0002',
            offer: {
               id: '4',
               name: 'Geforce RTX 5080 Super-puper x3 SET!!!',
            },
            quantity: 1,
            price: { amount: '20000', currency: 'PLN' },
         },
      ],

      status: 'READY_FOR_PROCESSING',

      fulfillment: {
         status: 'SENT',
      },

      delivery: {
         address: {
            firstName: 'Jan',
            lastName: 'Kowalski',
            street: 'Marszałkowska 10/12',
            city: 'Warszawa',
            zipCode: '00-590',
            countryCode: 'PL',
            companyName: null,
            phoneNumber: '+48501234567',
         },

         method: {
            id: 'b1c2d3e4-0000-1111-2222-333344445555',
            name: 'Allegro Paczkomaty InPost 24/7',
         },

         cost: {
            amount: '10.99',
            currency: 'PLN',
         },

         pickupPoint: {
            id: 'WAW123M',
            name: 'Paczkomat WAW123M',
            description: 'Przy wejściu do sklepu Żabka',
            address: {
               street: 'Złota 59',
               zipCode: '00-120',
               city: 'Warszawa',
               countryCode: 'PL',
            },
         },

         calculatedNumberOfPackages: 1,
      },

      invoice: {
         required: true,
      },

      summary: {
         totalToPay: {
            amount: '70010.99',
            currency: 'PLN',
         },
      },

      updatedAt: '2026-10-11T08:42:17.123Z',
   };

   return [mapOrder(mockOrder)];
}
