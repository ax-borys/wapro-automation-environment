import { db } from '@wae/db';

export * from './domain/offer';
export * from './domain/order';
export * from './domain/receipt';

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type { WaproConfig } from './wapro-types.ts';

export type Position = {
   productId: number;
   quantity: number;
   priceNetto: number;
   priceBrutto: number;
   vatCode: '23' | '8' | '0';
   discount: 0;
};

export type RecordReceiptWapro = {
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
