'use client';
import { useEffect } from 'react';
import { ReceiptModel, useReceiptsStore } from './receipt.store';

export const useReceipts = (initialReceipts: ReceiptModel[]) => {
   const receiptsExist = useReceiptsStore((s) => s.ensureReceipts)();
   const addReceipt = useReceiptsStore((s) => s.add);

   useEffect(() => {
      if (!receiptsExist) {
         initialReceipts.forEach((receipt) => addReceipt(receipt));
      }
   }, [initialReceipts]);

   return useReceiptsStore();
};

export const useReceipt = (
   id: ReceiptModel['orderId'],
   initialReceipt: ReceiptModel,
) => {
   const receiptExists = useReceiptsStore((s) => s.ensureReceipt)(id);
   const addReceipt = useReceiptsStore((s) => s.add);

   useEffect(() => {
      if (!receiptExists) {
         addReceipt(initialReceipt);
      }
   }, [initialReceipt]);

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
