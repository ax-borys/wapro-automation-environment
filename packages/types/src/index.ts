import { db } from '@wae/db';

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type Config = {
   companyId: number;
   cashRegisterId: number;
   counterPartyId: number;
   userId: number;
   stockId: number;
};

export type Order = {
   buyer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      login: string;
      phoneNumber: string;
   };
   buyerNote: string | null;
   lineItems: {
      offer: {
         id: string;
         name: string;
      };
      quantity: number;
      price: {
         amount: string;
         currency: 'PLN' | string;
      };
      boughtAt: string;
   }[];
   summary: {
      paymentStatus: 'PAID' | 'EXTERNAL_PAYMENT';
      totalToPay: {
         amount: string;
         currency: string;
      };
      totalPaid: {
         amount: string;
         currency: string;
      };
   };
};

export type Position = {
   productId: number;
   quantity: number;
   priceNetto: number;
   priceBrutto: number;
   vatCode: '23' | '8' | '0';
   discount: 0;
};

export type Receipt = {
   companyId: number;
   cashRegisterId: number;
   counterPartyId: number;
   userId: number;
   deposit: number;
   paymentDeadline: Date;
   paymentFormat: 'przelew' | 'gotówka' | 'pobranie' | 'przedpłata';
   pricingType: 'Brutto' | 'Netto';
   stockId: number;
   positions: Position[];
};

export type Mapping = {
   [key: string]: {
      offerName: string;
      products: { sid: number; quantity: number; vat: '23' | '8' | '0' }[];
   };
};

export type { ApiError, ApiResponse } from './api-contract.ts';
