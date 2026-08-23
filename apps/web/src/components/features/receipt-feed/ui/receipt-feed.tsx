'use client';

import { Fragment } from 'react/jsx-runtime';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ReceiptIcon } from '@phosphor-icons/react';
import {
   useSetReceipts,
   useReceipts,
   type Receipt as ReceiptType,
} from '@/entities/receipt/receipt.context';
import { Receipt } from '@/components/features/receipt';
import { useOrders } from '@/entities/order';
import { useEffect } from 'react';
import { recordReceipts } from '@/entities/receipt/record-receipts';
async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function ReceiptFeed({ initReceipts }: { initReceipts: ReceiptType[] }) {
   const orders = useOrders();
   const receipts = useReceipts();
   const setReceipts = useSetReceipts();

   const selected = receipts
      .filter((receipt) => receipt.selected)
      .map((receipt) => receipt.orderId);

   useEffect(() => {
      setReceipts([...initReceipts]);
   }, []);

   const selectAll = () =>
      setReceipts((prev) => prev.map((r) => ({ ...r, selected: true })));

   const removeAll = () =>
      setReceipts((prev) => prev.map((r) => ({ ...r, selected: false })));

   const selectAllHandler = () => {
      const isSelectedAll = selected.length === orders.length;

      if (isSelectedAll) {
         removeAll();
      } else {
         selectAll();
      }
   };
   const setReceiptsStatus = (
      receipts: ReceiptType[],
      status: ReceiptType['status'],
   ) =>
      setReceipts((prev) =>
         prev.map((r) =>
            receipts.find((r2) => r2.orderId === r.orderId)
               ? { ...r, status }
               : r,
         ),
      );

   const setReceiptsNumbers = (
      receipts: ReceiptType[],
      numbers: ReceiptType['number'][],
   ) => {
      setReceipts((prev) =>
         prev.map((r) =>
            receipts.find((r2) => r2.orderId === r.orderId)
               ? {
                    ...r,
                    number:
                       numbers[
                          receipts.map((r3) => r3.orderId).indexOf(r.orderId)
                       ],
                 }
               : r,
         ),
      );
   };

   const recordSelectedReceipts = async () => {
      const selectedReceipts = receipts.filter(
         (r) => r.selected && r.status === 'RECORD',
      );

      const selectedOrders = orders.filter((order) =>
         selectedReceipts.find((r) => r.orderId === order.orderId.toString()),
      );

      if (!selectedOrders.length) return;

      try {
         setReceiptsStatus(selectedReceipts, 'RECORDING');
         const result = await recordReceipts(selectedOrders);

         if (result.error) {
            setReceiptsStatus(selectedReceipts, 'RECORD');
            console.error(result.error);
            return;
         }

         const receipts = result.data;

         setReceiptsStatus(selectedReceipts, 'RECORDED');
         setReceiptsNumbers(
            selectedReceipts,
            receipts.map((receipt) => receipt.number),
         );
      } catch (error) {
         console.error(error);
         setReceiptsStatus(selectedReceipts, 'RECORD');
      }
   };

   return (
      <div className="h-screen">
         <div className="w-full h-12 px-6 flex items-center gap-3 text-muted-foreground text-sm">
            <div
               className="flex items-center gap-3 cursor-pointer"
               onClick={selectAllHandler}
            >
               <Checkbox
                  checked={selected.length === orders.length}
                  className="cursor-pointer"
               />
               <span className="">Select all</span>
            </div>
            {selected.length ? (
               <>
                  <Separator
                     orientation="vertical"
                     className="h-4 translate-y-4"
                  />
                  {selected.length}
                  <Separator
                     orientation="vertical"
                     className="h-4 translate-y-4"
                  />
                  <Button
                     size={'sm'}
                     variant={'ghost'}
                     className="cursor-pointer"
                     onClick={recordSelectedReceipts}
                     disabled={
                        receipts.find((r) => r.status === 'RECORDING') && true
                     }
                  >
                     <ReceiptIcon /> Record selected
                  </Button>
               </>
            ) : null}
         </div>
         <Separator />
         <div className="overflow-scroll max-h-full pb-28">
            {receipts.length
               ? orders.map((order, i) => (
                    <Fragment key={order.orderId}>
                       <Receipt order={order} />
                       {i + 1 === orders.length ? null : <Separator />}
                    </Fragment>
                 ))
               : null}
         </div>
      </div>
   );
}
