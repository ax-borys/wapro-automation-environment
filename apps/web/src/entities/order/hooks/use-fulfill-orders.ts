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
      }

      try {
         const receiptsAndInvoices = await fulfillOrdersApi(fulfillOrdersInput);

         receiptsAndInvoices.forEach((receiptOrInvoice) => {
            if ('fiscalNumber' in receiptOrInvoice) {
               attachReceipt(receiptOrInvoice.orderId, {
                  ...receiptOrInvoice,
                  createdAt: new Date(receiptOrInvoice.createdAt),
               });
            } else {
               attachInvoice(receiptOrInvoice.orderId, {
                  ...receiptOrInvoice,
                  createdAt: new Date(receiptOrInvoice.createdAt),
               });
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
