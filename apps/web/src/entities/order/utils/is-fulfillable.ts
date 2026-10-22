import { OrderModel } from '../types';
import { getInvoiceStatus, getReceiptStatus } from './get-document-status';

export function isFulfillable(order: OrderModel) {
   const requiredDocumentType = order.requiredDocumentType;
   const receipt = order.receipt;
   const invoice = order.invoice;

   const receiptStatus = getReceiptStatus(order);
   const invoiceStatus = getInvoiceStatus(order);

   switch (requiredDocumentType) {
      case 'RECEIPT':
         if (receiptStatus === 'RECORD' && receipt.draft.fiscalNumber) {
            return true;
         }
         return false;
      case 'INVOICE':
         if (invoiceStatus === 'RECORD' && invoice.draft.number) {
            return true;
         }
         return false;
      default: {
         return false;
      }
   }
}
