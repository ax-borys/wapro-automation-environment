import {
   Address,
   Customer,
   Delivery,
   Invoice,
   Order,
   OrderPoisition,
   Receipt,
   Recipient,
} from '@wae/types';
import { OfferModel } from '../offer';
import { client } from '@/lib/client';
import { InferResponseType } from 'hono/client';

export type Status = 'RECORD' | 'RECORDING' | 'RECORDED';

export type PositionModel = Omit<OrderPoisition, 'clientTag' | 'receiptId'> & {
   offer: OfferModel;
};

export type OriginalReceipt = Omit<Receipt, 'clientTag'>;
export type OriginalInvoice = Omit<Invoice, 'clientTag'>;

export type ReceiptModel = {
   original: OriginalReceipt | null;
   isRecording: boolean;
   draft: { fiscalNumber: Receipt['fiscalNumber'] | null };
};

export type InvoiceModel = {
   original: OriginalInvoice | null;
   isRecording: boolean;
   draft: { number: Invoice['number'] | null };
};

export type OrderServer = Omit<Order, 'clientTag' | 'requiredDocumentType'> & {
   customer: Omit<Customer, 'clientTag'> & {
      address:
         | Omit<Address, 'clientTag' | 'orderId' | 'customerId'>
         | null
         | undefined;
   };
   delivery: Omit<Delivery, 'clientTag'> & {
      address: Omit<Address, 'clientTag'>;
   };
   recipient: Omit<Recipient, 'clientTag' | 'addressId'>;
};

export type OrderModel = {
   id: OrderServer['id'];
   original: OrderServer;
   receipt: ReceiptModel;
   invoice: InvoiceModel;
   positions: Record<PositionModel['offer']['id'], PositionModel>;
   isSelected: boolean;
   requiredDocumentType: Order['requiredDocumentType'];
};

export type ServerFullOrder = NonNullable<
   InferResponseType<typeof client.order.orders.pending.$get>['data']
>[number];
