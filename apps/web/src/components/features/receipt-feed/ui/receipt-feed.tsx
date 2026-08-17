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

export function ReceiptFeed({ initReceipts }: { initReceipts: ReceiptType[] }) {
   const orders = useOrders();
   const receipts = useReceipts();
   const setReceipts = useSetReceipts();

   const selected = receipts
      .filter((receipt) => receipt.selected)
      .map((receipt) => receipt.orderId);

   useEffect(() => setReceipts(initReceipts), []);

   const selectAll = () => {
      const receiptsCopy = [...receipts];
      receipts.forEach((receipt, i) => {
         receiptsCopy[i] = {
            ...receipt,
            selected: true,
         };
      });

      setReceipts(receiptsCopy);
   };

   const removeAll = () => {
      const receiptsCopy = [...receipts];
      receipts.forEach((receipt, i) => {
         receiptsCopy[i] = {
            ...receipt,
            selected: false,
         };
      });

      setReceipts(receiptsCopy);
   };

   const selectAllHandler = () => {
      const isSelectedAll = selected.length === orders.length;

      if (isSelectedAll) {
         removeAll();
      } else {
         selectAll();
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
