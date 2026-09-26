'use client';
import { useEffect } from 'react';
import { ReceiptModel, useReceiptsStore } from './receipt.store';
import { RecordReceiptInput, recordReceipts } from './record-receipts';
import { errorModelSchema, useError } from '../error';
import * as v from 'valibot';

export const useReceipts = (initialReceipts: ReceiptModel[]) => {
   const receiptsExist = useReceiptsStore((s) => s.ensureReceipts)();
   const addReceipt = useReceiptsStore((s) => s.add);
   console.log('Receipts exist: ', receiptsExist);

   useEffect(() => {
      if (!receiptsExist) {
         initialReceipts.forEach((receipt) => addReceipt(receipt));
      }
   }, [initialReceipts]);

   return useReceiptsStore();
};

export const useReceipt = (id: ReceiptModel['orderId']) => {
   const { raiseError } = useError();
   const changeStatus = useReceiptsStore((s) => s.changeStatus).bind(null, id);
   const setNumber = useReceiptsStore((s) => s.setNumber).bind(null, id);
   const receipt: ReceiptModel = useReceiptsStore((s) => s.receipts[id]);

   const recordReceipt = async () => {
      changeStatus('RECORDING');
      if (!receipt) return;

      const fiscalNumber = receipt.fiscalNumber;
      const orderId = receipt.orderId;

      if (!fiscalNumber) {
         return;
      }

      try {
         const [receipt] = await recordReceipts([
            {
               orderId,
               fiscalNumber: String(fiscalNumber),
            },
         ]);

         changeStatus('RECORDED');
         setNumber(receipt.number);
      } catch (error) {
         const parsedError = v.safeParse(errorModelSchema, error);

         if (parsedError.success) {
            raiseError(parsedError.output);
         }

         changeStatus('RECORD');
      }
   };
   return {
      receipt,
      changeStatus,
      recordReceipt,
      setNumber,
      setFiscalNumber: useReceiptsStore((s) => s.setFiscalNumber).bind(
         null,
         id,
      ),
   };
};
