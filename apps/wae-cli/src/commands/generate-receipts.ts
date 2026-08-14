import distributeNumber from '@wae/core';
import { Config, Mapping, Order, Position, Receipt } from '@wae/types';
import currency from 'currency.js';

function calculatePaymentDeadline(
   paymentStatus: 'PAID' | 'EXTERNAL_PAYMENT',
): Date {
   const today = new Date();

   if (paymentStatus === 'EXTERNAL_PAYMENT') {
      const weekAhead = new Date(today);
      weekAhead.setDate(today.getDate() + 7);

      return weekAhead;
   }

   const interval = 14;
   const initialDate = new Date('2026-08-12');
   const term =
      interval -
      (Math.floor(
         (today.getTime() - initialDate.getTime()) / (1000 * 60 * 60 * 24),
      ) %
         interval);

   const deadlineDate = new Date();
   deadlineDate.setDate(today.getDate() + term);

   return deadlineDate;
}

function shrinkNumbersList(numbers: number[]) {
   const uniqueNumbers: { value: number; times: number }[] = [];

   numbers.forEach((number) => {
      const index = uniqueNumbers.findIndex((i) => i.value === number);

      if (index === -1) {
         uniqueNumbers.push({ value: number, times: 1 });
      } else {
         uniqueNumbers[index].times += 1;
      }
   });

   return uniqueNumbers;
}

export function generateReceipts(
   orders: Order[],
   map: Mapping,
   { companyId, userId, cashRegisterId, counterPartyId, stockId }: Config,
): Receipt[] {
   const receipts: Receipt[] = [];

   // Order beggining
   for (const order of orders) {
      const paymentStatus = order.summary.paymentStatus;

      if (paymentStatus !== 'PAID' && paymentStatus !== 'EXTERNAL_PAYMENT') {
         throw new Error(`Unsupported payment status: ${paymentStatus}`);
      }

      const positions: Position[] = [];

      order.lineItems.forEach((item) => {
         const mappedOffer = map[item.offer.id];

         if (!mappedOffer) {
            throw new Error('Offer has item that cannot be mapped');
         }

         mappedOffer.products.forEach((product) => {
            const distributedPrices = distributeNumber(
               currency(item.price.amount).intValue,
               product.quantity,
            );

            const shrankDistributedPrices =
               shrinkNumbersList(distributedPrices);

            shrankDistributedPrices.forEach((price) => {
               const position: Position = {
                  productId: product.sid,
                  priceBrutto: currency(price.value, { fromCents: true }).value,
                  priceNetto: currency(price.value, { fromCents: true }).divide(
                     1.23,
                  ).value,
                  quantity: price.times * item.quantity,
                  discount: 0,
                  vatCode: product.vat,
               };

               positions.push(position);
            });
         });
      });

      const receipt: Receipt = {
         companyId,
         userId,
         cashRegisterId,
         counterPartyId,
         deposit: 0,
         paymentDeadline: calculatePaymentDeadline(order.summary.paymentStatus),
         paymentFormat: paymentStatus === 'PAID' ? 'przedpłata' : 'pobranie',
         pricingType: 'Brutto',
         stockId,
         positions: positions,
      };

      receipts.push(receipt);
   }

   return receipts;
}
