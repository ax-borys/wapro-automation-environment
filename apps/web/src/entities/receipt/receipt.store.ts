import { use, useEffect } from 'react';
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
   select: (id: ReceiptModel['orderId']) => void;
   unselect: (id: ReceiptModel['orderId']) => void;
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

export const useReceipts = (initialReceipts: ReceiptModel[]) => {
   const receiptsExist = useReceiptsStore((s) => s.ensureReceipts)();
   const addReceipt = useReceiptsStore((s) => s.add);

   if (!receiptsExist) {
      initialReceipts.forEach((receipt) => addReceipt(receipt));
   }

   return useReceiptsStore();
};

export const useReceipt = (
   id: ReceiptModel['orderId'],
   initialReceipt: ReceiptModel,
) => {
   const receiptExists = useReceiptsStore((s) => s.ensureReceipt)(id);
   const addReceipt = useReceiptsStore((s) => s.add);

   if (!receiptExists) {
      addReceipt(initialReceipt);
   }

   return {
      receipt: useReceiptsStore((s) => s.receipts[id]),
      changeStatus: useReceiptsStore((s) => s.changeStatus).bind(null, id),
      select: useReceiptsStore((s) => s.select).bind(null, id),
      unselect: useReceiptsStore((s) => s.unselect).bind(null, id),
      selectToggle: useReceiptsStore((s) => s.selectToggle).bind(null, id),
      setNumber: useReceiptsStore((s) => s.setNumber).bind(null, id),
      setFiscalNumber: useReceiptsStore((s) => s.setFiscalNumber).bind(
         null,
         id,
      ),
   };
};
