import { Order } from '@wae/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ReceiptModel = {
   orderId: Order['id'];
   status: 'RECORD' | 'RECORDING' | 'RECORDED';
   selected?: boolean;
   number?: string | null;
   fiscalNumber?: string | null;
};

type ReceiptsStore = {
   receipts: Record<ReceiptModel['orderId'], ReceiptModel>;
   add: (receipt: ReceiptModel) => void;
   addMany: (receipts: ReceiptModel[]) => void;
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
      addMany: (receipts) =>
         set((s) => {
            receipts.forEach(
               (receipt) => (s.receipts[receipt.orderId] = receipt),
            );
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
