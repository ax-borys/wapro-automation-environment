import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ReceiptModel = {
   orderId: string;
   status: 'RECORD' | 'RECORDING' | 'RECORDED';
   selected?: boolean;
   number?: string | null;
   fiscalNumber?: number | null;
};

type ReceiptsStore = {
   receipts: Record<ReceiptModel['orderId'], ReceiptModel>;
   add: (receipt: ReceiptModel) => void;
   remove: (id: ReceiptModel['orderId']) => void;
   clear: () => void;
   changeStatus: (
      id: ReceiptModel['orderId'],
      status: ReceiptModel['status'],
   ) => void;
   changeStatusForMany: (
      ids: ReceiptModel['orderId'][],
      status: ReceiptModel['status'],
   ) => void;
   select: (id: ReceiptModel['orderId']) => void;
   unselect: (id: ReceiptModel['orderId']) => void;
   selectMany: (ids: ReceiptModel['orderId'][]) => void;
   unselectMany: (ids: ReceiptModel['orderId'][]) => void;
   selectAll: () => void;
   unselectAll: () => void;
   selectToggle: (id: ReceiptModel['orderId']) => void;
   setNumber: (
      id: ReceiptModel['orderId'],
      value: ReceiptModel['number'],
   ) => void;
   setFiscalNumber: (
      id: ReceiptModel['orderId'],
      value: ReceiptModel['fiscalNumber'],
   ) => void;
   ensureReceipt: (id: ReceiptModel['orderId']) => boolean;
   ensureReceipts: () => boolean;
};

export const useReceiptsStore = create<ReceiptsStore>()(
   immer((set, get) => ({
      receipts: {},
      add: (receipt) =>
         set((s) => {
            s.receipts[receipt.orderId] = receipt;
         }),
      remove: (id) =>
         set((s) => {
            delete s.receipts[id];
         }),
      clear: () =>
         set((s) => {
            s.receipts = {};
         }),
      changeStatus: (id, status) =>
         set((s) => {
            s.receipts[id].status = status;
         }),
      changeStatusForMany: (ids, status) => {
         ids.forEach((id) => get().changeStatus(id, status));
      },
      select: (id) =>
         set((s) => {
            s.receipts[id].selected = true;
         }),
      unselect: (id) =>
         set((s) => {
            s.receipts[id].selected = false;
         }),
      selectToggle: (id) =>
         set((s) => {
            s.receipts[id].selected = !s.receipts[id].selected;
         }),
      selectMany: (ids) =>
         set((s) => {
            ids.forEach((id) => (s.receipts[id].selected = true));
         }),
      unselectMany: (ids) =>
         set((s) => {
            ids.forEach((id) => (s.receipts[id].selected = false));
         }),
      selectAll: () =>
         set((s) => {
            Object.values(s.receipts).forEach((receipt) => {
               receipt.selected = true;
            });
         }),
      unselectAll: () =>
         set((s) => {
            Object.values(s.receipts).forEach((receipt) => {
               receipt.selected = false;
            });
         }),
      setNumber: (id, value) =>
         set((s) => {
            s.receipts[id].number = value;
         }),
      setFiscalNumber: (id, value) =>
         set((s) => {
            s.receipts[id].fiscalNumber = value;
         }),
      ensureReceipt: (id) => {
         return get().receipts[id] ? true : false;
      },
      ensureReceipts: () => {
         return Object.values(get().receipts).length ? true : false;
      },
   })),
);
