import distributeNumber from "@wae/core";

type  Config = {
   companyId: number;
   cashRegisterId: number;
   counterPartyId: number;
   userId: number;
   stockId: number;
};

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

type Position = {
      productId: number;
      quantity: number;
      priceNetto: number;
      priceBrutto: number;
      vatCode: '23' | '8' | '0';
      discount: 0;
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
   positions: Position[];
};

type Mapping = {
   [key: string]: {
      offerName: string;
      products: {sid: number, quantity:number, vat: '23' | '8' |'0' }[];
   } 
}

function calculatePaymentDeadline(initialDate: Date, interval: number): Date {
   const today = new Date();
   const deadline = (interval - Math.floor((today.getTime() - initialDate.getTime()) / (1000 * 60 * 60 * 24)) % interval);

   const deadlineDate = new Date();
   deadlineDate.setDate(today.getDate() + deadline);

   return deadlineDate;
}

export function convert(data: Order[], map: Mapping, {companyId, userId, cashRegisterId, counterPartyId, stockId}: Config): Receipt[] | [] {
 
   const receipts: Receipt[] | [] = [];
   const sevenDaysAhead = new Date();
   sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);


   for (const order of data) {

      const mappedPositions: Receipt['positions'] = [];

      order.lineItems.forEach(i => {
         const mappedOffer = map[i.offer.id];

         if (!mappedOffer) {
            throw new Error('Offer has item that cannot be mapped');
         }

         mappedOffer.products.forEach(p => {
            const calculatedBruttos = distributeNumber(Number.parseInt(i.price.amount) * 100, p.quantity);

            const positions: Position[] = [];

            calculatedBruttos.forEach(b => {
               const position: Position = {
                  priceBrutto: b / 100,
                  priceNetto: Math.
               }
            })
         });
         
      });

      const receipt: Receipt = {
         companyId,
         userId,
         cashRegisterId,
         counterPartyId,
         deposit: 0,
         paymentDeadline: order.summary.paymentStatus ==='PAID' ? calculatePaymentDeadline(new Date('2026-07-29'),  14) : sevenDaysAhead,
         paymentFormat: order.summary.paymentStatus ==='PAID' ? 'przedpłata' : 'pobranie',
         pricingType: 'Brutto',
         stockId,
         positions: mappedPosition,

      }
   }

   return receipts;
}
