import { WaproConfig, Mapping, RecordReceiptWaproPosition } from '@wae/types';
import { type RecordReceiptInput } from '@wae/wapro';

import currency from 'currency.js';

import {
   unmappedOfferId,
   unsupportedPaymentMethod,
   wrongCalculation,
} from './../errors';
import { GenerateReceiptInput } from '../schema';

const MS_PER_DAY = 86_400_000;
const CYCLE_DAYS = 14;
const CYCLE_START = Date.UTC(2026, 7, 12); // Aug 12. Check it's the date you intend.

function addDays(date: Date, days: number): Date {
   return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function calculatePaymentDeadline(
   paymentMethod: 'PREPAID' | 'POSTPAID',
   now: Date,
): Date {
   if (paymentMethod === 'POSTPAID') return addDays(now, 7);

   const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
   const daysSinceStart = (today - CYCLE_START) / MS_PER_DAY;
   const daysIntoCycle =
      ((daysSinceStart % CYCLE_DAYS) + CYCLE_DAYS) % CYCLE_DAYS;

   return addDays(now, CYCLE_DAYS - daysIntoCycle);
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

const vatCodes: Record<RecordReceiptWaproPosition['vatCode'], number> = {
   '0': 0,
   '8': 8,
   '23': 23,
} as const;

export function generateReceipts(
   receiptInputs: GenerateReceiptInput[],
   map: Mapping,
   {
      companyId,
      userId,
      cashRegisterId,
      counterPartyId,
      stockId,
      bankAccountNumber,
   }: WaproConfig,
): RecordReceiptInput[] {
   const now = new Date();

   const receipts: RecordReceiptInput[] = [];

   // Order beggining
   for (const receiptInput of receiptInputs) {
      const paymentMethod = receiptInput.paymentMethod;

      if (paymentMethod !== 'PREPAID' && paymentMethod !== 'POSTPAID') {
         throw unsupportedPaymentMethod(paymentMethod);
      }

      const positions: RecordReceiptWaproPosition[] = [];

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
               const position: RecordReceiptWaproPosition = {
                  productId: product.sid,
                  priceBrutto: currency(price.value, { fromCents: true }).value,
                  priceNetto: currency(price.value, { fromCents: true }).divide(
                     (100 + vatCodes[product.vat]) / 100,
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
         bankAccountNumber,
         counterPartyId,
         deposit: 0,
         paymentDeadline: calculatePaymentDeadline(
            receiptInput.paymentMethod,
            now,
         ),
         paymentFormat: paymentMethod === 'PREPAID' ? 'przedpłata' : 'pobranie',
         pricingType: 'Brutto',
         stockId,
         positions: positions,
      };

      receipts.push(receipt);
   }

   return receipts;
}
