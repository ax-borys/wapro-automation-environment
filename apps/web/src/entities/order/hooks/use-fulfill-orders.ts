import { ReceiptModel, useReceiptsStore } from '@/entities/receipt';
import { OrderModel, useOrdersStore } from '../orders.store';
import { errorModelSchema, useError } from '@/entities/error';

import * as v from 'valibot';

import {
   fulfillOrders as fulfillOrdersApi,
   FulfillOrdersInput,
} from '../api/fulfill-orders';
import { number } from 'valibot';
import { formatError } from '../../../../../api/dist/helpers/format-error';
import { setRequestMeta } from 'next/dist/server/request-meta';

export function useFulfillOrders(orderIds: OrderModel['id'][]) {
   const { raiseError } = useError();

   const orders = useOrdersStore((s) => s.orders);
   const ordersList: OrderModel[] = Object.values(orders);

   const receipts = useReceiptsStore((s) => s.receipts);
   const receiptsList: ReceiptModel[] = Object.values(receipts);

   const changeReceiptStatus = useReceiptsStore((s) => s.changeStatus);
   const changeInvoiceStatus = useOrdersStore((s) => s.changeInvoiceStatus);

   const setReceiptNumber = useReceiptsStore((s) => s.setNumber);
   const setInvoiceNumber = useOrdersStore((s) => s.setInvoiceNumber);

   const changeStatus = (
      orderId: OrderModel['id'],
      status: OrderModel['invoice']['status'],
   ) => {
      changeReceiptStatus(orderId, status);
      changeInvoiceStatus(orderId, status);
   };

   const fulfillOrders = async (orderIdsOverride?: typeof orderIds) => {
      const finalOrderIds = orderIdsOverride ?? orderIds;

      if (!finalOrderIds.length) return;

      const fulfillableOrders = ordersList
         .filter((order) => finalOrderIds.find((id) => order.id === id))
         .filter(
            (order) =>
               order.invoice.number ||
               receiptsList.find((r) => r.orderId === order.id)?.fiscalNumber,
         );

      fulfillableOrders.forEach((order) => changeStatus(order.id, 'RECORDING'));

      const fulfillOrdersInput: FulfillOrdersInput = fulfillableOrders.map(
         (order) => {
            const receipt = receiptsList.find((r) => r.orderId === order.id);

            return {
               orderId: order.id,
               number: order.invoice.number,
               fiscalNumber: receipt?.fiscalNumber,
            };
         },
      );

      try {
         const receiptsAndInvoices = await fulfillOrdersApi(fulfillOrdersInput);

         receiptsAndInvoices.forEach((receiptOrInvoice) => {
            if ('fiscalNumber' in receiptOrInvoice) {
               setReceiptNumber(
                  receiptOrInvoice.orderId,
                  receiptOrInvoice.number,
               );
            } else {
               setInvoiceNumber(
                  receiptOrInvoice.orderId,
                  receiptOrInvoice.number,
               );
            }
         });

         fulfillableOrders.forEach((order) =>
            changeStatus(order.id, 'RECORDED'),
         );
      } catch (error) {
         const parsedError = v.safeParse(errorModelSchema, error);

         if (parsedError.success) {
            raiseError(parsedError.output);
         }

         fulfillableOrders.forEach((order) => changeStatus(order.id, 'RECORD'));
      }
   };

   return fulfillOrders;
}
