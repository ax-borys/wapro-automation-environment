import {
   Address,
   Customer,
   Delivery,
   Invoice,
   Item,
   Offer,
   Order,
   OrderPoisition,
   Product,
   Receipt,
   Recipient,
} from '@wae/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { OfferModel, ProductModel } from '../offer';
import {
   InvoiceModel,
   OrderModel,
   OriginalInvoice,
   OriginalReceipt,
   PositionModel,
   ReceiptModel,
   Status,
} from './types';
import {
   getInvoiceStatus,
   getReceiptStatus,
} from './utils/get-document-status';
import { formatFiscalNumber } from './utils/format-fiscal-number';

export type OrdersStore = {
   orders: Record<OrderModel['id'], OrderModel>;
   add: (order: OrderModel) => void;
   addMany: (orders: OrderModel[]) => void;
   attachReceipt: (orderId: OrderModel['id'], receipt: OriginalReceipt) => void;
   attachInvoice: (orderId: OrderModel['id'], invoice: OriginalInvoice) => void;
   remove: (orderId: OrderModel['id']) => void;
   select: (id: OrderModel['id']) => void;
   unselect: (id: OrderModel['id']) => void;
   selectMany: (ids: OrderModel['id'][]) => void;
   unselectMany: (ids: OrderModel['id'][]) => void;
   selectAll: () => void;
   unselectAll: () => void;
   selectToggle: (id: OrderModel['id']) => void;
   addPosition: (orderId: OrderModel['id'], position: PositionModel) => void;
   removePosition: (
      orderId: OrderModel['id'],
      positionId: PositionModel['offer']['id'],
   ) => void;
   setDraftInvoiceNumber: (orderId: OrderModel['id'], value: string) => void;
   setDraftFiscalNumber: (orderId: OrderModel['id'], value: number) => void;
   clearDraftInvoiceNumber: (orderId: OrderModel['id']) => void;
   clearDraftFiscalNumber: (orderId: OrderModel['id']) => void;
   changeRequiredDocuemntType: (
      orderId: OrderModel['id'],
      value: OrderModel['requiredDocumentType'],
   ) => void;
   getStatus: (orderId: OrderModel['id']) => Status;
   startRecording: (orderId: OrderModel['id']) => void;
   finishRecording: (orderId: OrderModel['id']) => void;
};

export function normilizePositions(
   positionsArr: PositionModel[],
): Record<PositionModel['offer']['id'], PositionModel> {
   const position: Record<PositionModel['offer']['id'], PositionModel> = {};

   positionsArr.forEach((p) => (position[p.offer.id] = p));

   return position;
}

export const useOrdersStore = create<OrdersStore>()(
   immer((set, get) => ({
      orders: {},
      add: (order) =>
         set((draft) => {
            draft.orders[order.id] = order;
         }),
      addMany: (orders) =>
         set((draft) => {
            orders.forEach((order) => {
               draft.orders[order.id] = order;
            });
         }),
      attachReceipt: (orderId, receipt) =>
         set((draft) => {
            if (draft.orders[orderId].receipt.original) return;

            draft.orders[orderId].receipt.original = receipt;
         }),
      attachInvoice: (orderId, invoice) =>
         set((draft) => {
            if (draft.orders[orderId].invoice.original) return;

            draft.orders[orderId].invoice.original = invoice;
         }),
      remove: (orderId) =>
         set((draft) => {
            delete draft.orders[orderId];
         }),
      select: (id) =>
         set((s) => {
            s.orders[id].isSelected = true;
         }),
      unselect: (id) =>
         set((s) => {
            s.orders[id].isSelected = false;
         }),
      selectToggle: (id) =>
         set((s) => {
            s.orders[id].isSelected = !s.orders[id].isSelected;
         }),
      selectMany: (ids) =>
         set((s) => {
            ids.forEach((id) => (s.orders[id].isSelected = true));
         }),
      unselectMany: (ids) =>
         set((s) => {
            ids.forEach((id) => (s.orders[id].isSelected = false));
         }),
      selectAll: () =>
         set((s) => {
            Object.values(s.orders).forEach((receipt) => {
               receipt.isSelected = true;
            });
         }),
      unselectAll: () =>
         set((s) => {
            Object.values(s.orders).forEach((receipt) => {
               receipt.isSelected = false;
            });
         }),
      addPosition: (orderId, position) =>
         set((draft) => {
            draft.orders[orderId].positions[position.offer.id] = position;
         }),
      removePosition: (orderId, positionId) =>
         set((draft) => {
            delete draft.orders[orderId].positions[positionId];
         }),
      setDraftInvoiceNumber: (orderId, value) =>
         set((draft) => {
            draft.orders[orderId].invoice.draft.number = value;
         }),
      setDraftFiscalNumber: (orderId, value) =>
         set((draft) => {
            const formattedValue = formatFiscalNumber(value);

            draft.orders[orderId].receipt.draft.fiscalNumber = formattedValue;
         }),
      changeRequiredDocuemntType: (orderId, value) =>
         set((draft) => {
            draft.orders[orderId].requiredDocumentType = value;
         }),
      getStatus: (orderId) => {
         const order = get().orders[orderId];

         switch (order.requiredDocumentType) {
            case 'RECEIPT':
               return getReceiptStatus(order);
            case 'INVOICE':
               return getInvoiceStatus(order);
         }
      },
      startRecording: (orderId) =>
         set((draft) => {
            const order = draft.orders[orderId];

            switch (order.requiredDocumentType) {
               case 'RECEIPT':
                  order.receipt.isRecording = true;
                  break;
               case 'INVOICE':
                  order.invoice.isRecording = true;
                  break;
               default:
                  break;
            }
         }),
      finishRecording: (orderId) =>
         set((draft) => {
            const order = draft.orders[orderId];

            switch (order.requiredDocumentType) {
               case 'RECEIPT':
                  order.receipt.isRecording = false;
                  break;
               case 'INVOICE':
                  order.invoice.isRecording = false;
                  break;
               default:
                  break;
            }
         }),
      clearDraftFiscalNumber: (orderId) =>
         set((draft) => {
            draft.orders[orderId].receipt.draft.fiscalNumber = null;
         }),
      clearDraftInvoiceNumber: (orderId) =>
         set((draft) => {
            draft.orders[orderId].invoice.draft.number = null;
         }),
   })),
);

export function useInvoiceNumber(orderId: OrderModel['id']) {
   const invoiceNumber = useOrdersStore(
      (s) =>
         s.orders[orderId]?.invoice.draft.number ??
         s.orders[orderId]?.invoice.original?.number ??
         null,
   );

   return invoiceNumber;
}

export function useFiscalNumber(orderId: OrderModel['id']) {
   const fiscalNumber = useOrdersStore(
      (s) =>
         s.orders[orderId]?.receipt.draft.fiscalNumber ??
         s.orders[orderId].receipt.original?.number ??
         null,
   );
   return fiscalNumber;
}

export function useReceipt(orderId: OfferModel['id']) {
   const receipt = useOrdersStore((s) => s.orders[orderId]?.receipt);

   return receipt;
}

export function useInvoice(orderId: OfferModel['id']) {
   const invoice = useOrdersStore((s) => s.orders[orderId]?.invoice);

   return invoice;
}
