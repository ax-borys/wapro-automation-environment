import { useOrdersStore } from '../orders.store';
import { errorModelSchema, useError } from '@/entities/error';

import * as v from 'valibot';

import {
   fulfillOrders as fulfillOrdersApi,
   FulfillOrdersInput,
} from '../api/fulfill-orders';
import { isFulfillable } from '../utils/is-fulfillable';
import { OrderModel } from '../types';

export function useFulfillOrders(orderIds: OrderModel['id'][]) {
   const { raiseError } = useError();

   const orders = useOrdersStore((s) => s.orders);
   const clearDraftFiscalNumber = useOrdersStore(
      (s) => s.clearDraftFiscalNumber,
   );
   const clearDraftInvoiceNumber = useOrdersStore(
      (s) => s.clearDraftInvoiceNumber,
   );

   const startRecording = useOrdersStore((s) => s.startRecording);
   const finishRecording = useOrdersStore((s) => s.finishRecording);

   const attachReceipt = useOrdersStore((s) => s.attachReceipt);
   const attachInvoice = useOrdersStore((s) => s.attachInvoice);

   const fulfillOrders = async (orderIdsOverride?: typeof orderIds) => {
      const finalOrderIds = new Set(orderIdsOverride ?? orderIds);

      if (!finalOrderIds.size) return;

      const fulfillOrdersInput: FulfillOrdersInput = [];

      for (const orderId of finalOrderIds) {
         const order = orders[orderId];

         if (!isFulfillable(order)) continue;

         startRecording(order.id);

         if (order.invoice.draft.number) {
            fulfillOrdersInput.push({
               orderId: order.id,
               number: order.invoice.draft.number,
            });
         } else if (order.receipt.draft.fiscalNumber) {
            fulfillOrdersInput.push({
               orderId: order.id,
               fiscalNumber: order.receipt.draft.fiscalNumber,
            });
         }
      }

      try {
         const receiptsAndInvoices = await fulfillOrdersApi(fulfillOrdersInput);

         receiptsAndInvoices.forEach((receiptOrInvoice) => {
            if ('fiscalNumber' in receiptOrInvoice) {
               attachReceipt(receiptOrInvoice.orderId, {
                  ...receiptOrInvoice,
                  createdAt: new Date(receiptOrInvoice.createdAt),
               });

               clearDraftFiscalNumber(receiptOrInvoice.orderId);
            } else {
               attachInvoice(receiptOrInvoice.orderId, {
                  ...receiptOrInvoice,
                  createdAt: new Date(receiptOrInvoice.createdAt),
               });

               clearDraftInvoiceNumber(receiptOrInvoice.orderId);
            }
         });
      } catch (error) {
         const parsedError = v.safeParse(errorModelSchema, error);

         if (parsedError.success) {
            raiseError(parsedError.output);
         }
      } finally {
         fulfillOrdersInput.forEach((input) => finishRecording(input.orderId));
      }
   };

   return fulfillOrders;
}
