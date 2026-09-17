'use client';

import { Fragment } from 'react/jsx-runtime';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ReceiptIcon } from '@phosphor-icons/react';
import { useReceiptsStore } from '@/entities/receipt';
import { recordReceipts } from '@/entities/receipt';
import {
   normilizePositions,
   useOrdersStore,
} from '@/entities/order/orders.store';
import { useEffect } from 'react';
import { fetchPendingOrders } from '@/entities/order/fetch-pending-orders';
import { Order } from '@/components/features/order';

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function OrdersList() {
   const { orders, addMany, selectAll, unselectAll } = useOrdersStore();
   const {
      receipts,
      addMany: addManyReceipts,
      changeStatusForMany,
      setNumber,
   } = useReceiptsStore();

   useEffect(() => {
      // Update only user refreshes page manually.

      if (Object.values(orders).length) return;
      const promise = fetchPendingOrders();

      promise.then((pendingOrders) => {
         addMany(
            pendingOrders.map((order) => ({
               ...order,
               receipt: order.receipt
                  ? {
                       ...order.receipt,
                       createdAt: new Date(order.receipt.createdAt),
                    }
                  : null,
               selected: false,
               positions: normilizePositions(order.positions),
               createdAt: new Date(order.createdAt),
               preparedAt: new Date(order.preparedAt),
               fulfilledAt: null,
            })),
         );

         addManyReceipts(
            pendingOrders.map((order) => ({
               orderId: order.id,
               ...(order.receipt
                  ? {
                       status: 'RECORDED',
                       fiscalNumber: order.receipt.fiscalNumber,
                       number: order.receipt.number,
                    }
                  : { status: 'RECORD' }),
            })),
         );
      });
   }, []);

   const ordersList = Object.values(orders);
   ordersList.sort((a, b) => (a.receipt && b.receipt ? 0 : a.receipt ? 1 : -1));

   const selectedOrders = ordersList.filter((order) => order.selected);

   const selectAllHandler = () => {
      const isSelectedAll = selectedOrders.length === ordersList.length;

      if (isSelectedAll) {
         unselectAll();
      } else {
         selectAll();
      }
   };

   const distributeNumbers = (
      receiptsInfo: { orderId: number; number: string }[],
   ) => {
      for (const receiptInfo of receiptsInfo) {
         setNumber(receiptInfo.orderId, receiptInfo.number);
      }
   };

   const recordSelectedReceipts = async () => {
      const selectedReceipts = selectedOrders
         .filter((order) => order.requiredDocumentType === 'RECEIPT')
         .map((order) => receipts[order.id]);

      const selectedReceiptsIds = selectedReceipts.map(
         (receipt) => receipt.orderId,
      );

      if (!selectedReceipts.length) return;

      try {
         changeStatusForMany(selectedReceiptsIds, 'RECORDING');
         const receipts = await recordReceipts(
            selectedReceipts.map((receipt) => {
               if (!receipt.fiscalNumber) {
                  throw new Error("Receipt doesn't have fiscalNumber.");
               }

               return {
                  orderId: receipt.orderId,
                  fiscalNumber: receipt.fiscalNumber,
               };
            }),
         );

         changeStatusForMany(selectedReceiptsIds, 'RECORDED');
         distributeNumbers(
            receipts.map((i) => ({
               orderId: i.orderId,
               number: i.number,
            })),
         );
      } catch (error) {
         console.error(error);
         changeStatusForMany(selectedReceiptsIds, 'RECORD');
      }
   };

   return (
      <div className="flex-1 min-h-0 flex flex-col">
         <div className="w-full h-12 px-6 flex items-center gap-3 text-muted-foreground text-sm shrink-0">
            <div
               className="flex items-center gap-3 cursor-pointer"
               onClick={selectAllHandler}
            >
               <Checkbox
                  checked={selectedOrders.length === ordersList.length}
                  className="cursor-pointer"
               />
               <span className="">
                  Select all{' '}
                  {Object.values(receipts).length && !selectedOrders.length
                     ? `(${Object.values(receipts).length})`
                     : null}
               </span>
            </div>
            {selectedOrders.length ? (
               <>
                  <Separator
                     orientation="vertical"
                     className="h-4 translate-y-4"
                  />
                  {selectedOrders.length}
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
                        Object.values(receipts).find(
                           (r) => r.status === 'RECORDING',
                        ) && true
                     }
                  >
                     <ReceiptIcon /> Record selected
                  </Button>
               </>
            ) : null}
         </div>
         <Separator />
         <div className="overflow-y-scroll min-h-0 flex-1">
            {Object.values(receipts).length
               ? ordersList.map((order, i) => (
                    <Fragment key={order.id}>
                       <Order id={order.id} />
                       {i + 1 === ordersList.length ? null : <Separator />}
                    </Fragment>
                 ))
               : null}
         </div>
      </div>
   );
}
