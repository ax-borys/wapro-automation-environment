'use client';

import { Fragment } from 'react/jsx-runtime';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ReceiptIcon } from '@phosphor-icons/react';
import { Receipt } from '@/components/features/receipt';
import { ReceiptModel, useReceipts } from '@/entities/receipt';
import { recordReceipts } from '@/entities/receipt';
import {
   normilizePositions,
   useOrdersStore,
} from '@/entities/order/orders.store';
import currency from 'currency.js';
import { useEffect } from 'react';
import { fetchPendingOrders } from '@/entities/order/fetch-pending-orders';
import { type PositionModel } from '@/entities/order/orders.store';
import { fetchMockPendingOrders } from '@/entities/order/fetch-mock-pending-orders';

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

export function ReceiptFeed({
   initReceipts,
}: {
   initReceipts: ReceiptModel[];
}) {
   const { orders, addMany } = useOrdersStore();

   useEffect(() => {
      const promise = fetchMockPendingOrders();

      promise.then((pendingOrders) => {
         addMany(
            pendingOrders.map((order) => ({
               ...order,
               positions: normilizePositions(order.positions),
               createdAt: new Date(order.createdAt),
               preparedAt: new Date(order.preparedAt),
               fulfilledAt: new Date(order.fulfilledAt),
            })),
         );
      });
   }, []);

   const ordersList = Object.values(orders);
   const { receipts, selectAll, unselectAll, changeStatusForMany, setNumber } =
      useReceipts(initReceipts);
   console.log('Receipts: ', receipts);
   const selected = Object.values(receipts).filter(
      (receipt) => receipt.selected,
   );

   const selectAllHandler = () => {
      const isSelectedAll = selected.length === ordersList.length;

      if (isSelectedAll) {
         unselectAll();
      } else {
         selectAll();
      }
   };

   const distributeNumbers = (
      receiptsInfo: Pick<ReceiptModel, 'orderId' | 'number'>[],
   ) => {
      for (const receiptInfo of receiptsInfo) {
         setNumber(receiptInfo.orderId, receiptInfo.number);
      }
   };

   const recordSelectedReceipts = async () => {
      const selectedReceipts = Object.values(receipts).filter(
         (
            r,
         ): r is Omit<ReceiptModel, 'fiscalNumber'> & {
            fiscalNumber: number;
         } =>
            (r.selected && r.status === 'RECORD' && r.fiscalNumber) as boolean,
      );

      const selectedIds = selectedReceipts.map((i) => i.orderId);

      const selectedOrders = ordersList
         .filter((order) =>
            selectedReceipts.find((r) => r.orderId === order.externalId),
         )
         .map((order) => ({
            ...order,
            fiscalNumber: selectedReceipts.find(
               (r) => r.orderId === order.externalId,
            )!.fiscalNumber,
         }));

      if (!selectedOrders.length) return;

      try {
         changeStatusForMany(selectedIds, 'RECORDING');
         const receipts = await recordReceipts(
            selectedOrders.map((order) => ({
               ...order,
               orderId: Number(order.externalId),
               recipientFirstName: order.customer.firstName!,
               recipientLastName: order.customer.lastName!,
               positions: Object.values(order.positions).map((p) => ({
                  quantity: p.quantity,
                  orderId: p.orderId,
                  price: p.price,
                  externalId: p.offer.externalId,
                  title: p.offer.title,
               })),
               packagesMade: order.packages,
            })),
         );

         changeStatusForMany(selectedIds, 'RECORDED');
         distributeNumbers(
            receipts.map((i) => ({
               orderId: i.orderId.toString(),
               number: i.number,
            })),
         );
      } catch (error) {
         console.error(error);
         changeStatusForMany(selectedIds, 'RECORD');
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
                  checked={selected.length === ordersList.length}
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
                    <Fragment key={order.externalId}>
                       <Receipt order={order} />
                       {i + 1 === ordersList.length ? null : <Separator />}
                    </Fragment>
                 ))
               : null}
         </div>
      </div>
   );
}
