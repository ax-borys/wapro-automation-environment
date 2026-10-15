import { ReceiptModel, useReceiptsStore } from '@/entities/receipt';
import { OrderModel, useOrdersStore } from '../orders.store';
import { errorModelSchema, useError } from '@/entities/error';

import * as v from 'valibot';

import {
   fulfillOrders as fulfillOrdersApi,
   FulfillOrdersInput,
} from '../api/fulfill-orders';

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
      const finalOrderIds = new Set(orderIdsOverride ?? orderIds);
      const receiptByOrderId = new Map(
         receiptsList.map((receipt) => [receipt.orderId, receipt]),
      );

      if (!finalOrderIds.size) return;

      const fulfillOrdersInput: FulfillOrdersInput = [];

      for (const orderId of finalOrderIds) {
         const order = orders[orderId];
         const receipt = receiptByOrderId.get(order.id);

         const invoiceNumber = order.invoice.number;
         const fiscalNumber = receipt?.fiscalNumber || null;

         if (!invoiceNumber && !fiscalNumber) continue;

         if (fiscalNumber) {
            fulfillOrdersInput.push({
               orderId: order.id,
               fiscalNumber,
            });
         } else if (invoiceNumber) {
            fulfillOrdersInput.push({
               orderId: order.id,
               number: invoiceNumber,
            });
         }

         changeStatus(order.id, 'RECORDING');
      }

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

         fulfillOrdersInput.forEach((input) =>
            changeStatus(input.orderId, 'RECORDED'),
         );
      } catch (error) {
         const parsedError = v.safeParse(errorModelSchema, error);

         if (parsedError.success) {
            raiseError(parsedError.output);
         }

         fulfillOrdersInput.forEach((input) =>
            changeStatus(input.orderId, 'RECORD'),
         );
      }
   };

   return fulfillOrders;
}
