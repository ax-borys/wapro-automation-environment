type Order = {
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
      paymentStatus: 'PAID' | string;
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

type Receipt = {
   companyId: number;
   cashRegisterId: number;
   counterPartyId: number;
   userId: number;
   deposit: number;
   paymentDeadline: Date;
   paymentFormat: 'przelew' | 'gotówka' | 'pobranie' | 'przedpłata';
   pricingType: 'Brutto' | 'Netto';
   stockId: number;
   positions: {
      productId: number;
      quantity: number;
      priceNetto: number;
      priceBrutto: number;
      vatCode: '23' | '8' | '0';
      discount: 0;
   };
};

export function convert(data: Orders) {}

