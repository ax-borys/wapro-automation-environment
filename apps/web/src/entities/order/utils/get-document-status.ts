import { OrderModel, Status } from '../types';

export function getReceiptStatus(order: OrderModel): Status {
   const receipt = order.receipt;

   if (receipt.original) {
      return 'RECORDED';
   } else if (receipt.isRecording) {
      return 'RECORDING';
   } else return 'RECORD';
}

export function getInvoiceStatus(order: OrderModel): Status {
   const invoice = order.invoice;

   if (invoice.original) {
      return 'RECORDED';
   } else if (invoice.isRecording) {
      return 'RECORDING';
   } else return 'RECORD';
}
