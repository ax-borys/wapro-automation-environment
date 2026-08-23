import { Config, Mapping, Position } from '@wae/types';
import { type RecordReceiptInput } from '@wae/wapro';

import currency from 'currency.js';

import {
   unmappedOfferId,
   unsupportedPaymentMethod,
   wrongCalculation,
} from './../errors';
import { GenerateReceiptInput } from '../schema';

function calculatePaymentDeadline(paymentMethod: 'PREPAID' | 'POSTPAID'): Date {
   const today = new Date();

   if (paymentMethod === 'POSTPAID') {
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
   receiptInputs: GenerateReceiptInput[],
   map: Mapping,
   { companyId, userId, cashRegisterId, counterPartyId, stockId }: Config,
): RecordReceiptInput[] {
   const receipts: RecordReceiptInput[] = [];

   // Order beggining
   for (const receiptInput of receiptInputs) {
      const paymentMethod = receiptInput.paymentMethod;

      if (paymentMethod !== 'PREPAID' && paymentMethod !== 'POSTPAID') {
         throw unsupportedPaymentMethod(paymentMethod);
      }

      const positions: Position[] = [];

      receiptInput.items.forEach((item) => {
         const mappedOffer = map[item.offerId];

         if (!mappedOffer) {
            throw unmappedOfferId(item.offerId);
         }

         const productsPrices = currency(item.price).distribute(
            mappedOffer.products.length,
         );

         mappedOffer.products.forEach((product, i) => {
            const productPrices = currency(productsPrices[i])
               .distribute(product.quantity)
               .map((c) => c.intValue);

            const shrankProductPrices = shrinkNumbersList(productPrices);

            shrankProductPrices.forEach((price) => {
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

      let total = 0;

      positions.forEach(
         (i) =>
            (total = currency(i.priceBrutto)
               .multiply(i.quantity)
               .add(total).value),
      );

      if (currency(total).intValue !== currency(receiptInput.total).intValue) {
         throw wrongCalculation(
            currency(receiptInput.total).value,
            currency(total).value,
         );
      }

      const receipt: RecordReceiptInput = {
         id: receiptInput.id,
         companyId,
         userId,
         cashRegisterId,
         counterPartyId,
         deposit: 0,
         paymentDeadline: calculatePaymentDeadline(receiptInput.paymentMethod),
         paymentFormat: paymentMethod === 'PREPAID' ? 'przedpłata' : 'pobranie',
         pricingType: 'Brutto',
         stockId,
         positions: positions,
      };

      receipts.push(receipt);
   }

   return receipts;
}
