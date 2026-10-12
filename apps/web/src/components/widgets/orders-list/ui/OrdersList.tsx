'use client';

import { Fragment } from 'react/jsx-runtime';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ReceiptIcon } from '@phosphor-icons/react';
import { useReceiptsStore } from '@/entities/receipt';
import {
   normilizePositions,
   OrderModel,
   useOrdersStore,
} from '@/entities/order/orders.store';
import { useEffect } from 'react';
import { fetchPendingOrders } from '@/entities/order/fetch-pending-orders';
import { Order } from '@/components/features/order';
import { sortOrders, useFulfillOrders } from '@/entities/order';
import { normilizeItems } from '@/entities/offer';

export function OrdersList() {
   const { orders, addMany, selectAll, unselectAll } = useOrdersStore();
   const {
      receipts,
      addMany: addManyReceipts,
      setFiscalNumber,
   } = useReceiptsStore();

   const fulfillOrders = useFulfillOrders(
      Object.values(orders).map((order) => order.id),
   );

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
               invoice: order.invoice
                  ? {
                       number: order.invoice.number,
                       status: 'RECORDED',
                    }
                  : {
                       number: null,
                       status: 'RECORD',
                    },
               selected: false,
               positions: normilizePositions(
                  order.positions.map((position) => ({
                     ...position,
                     offer: {
                        ...position.offer,
                        items: normilizeItems(
                           position.offer.items.flatMap((item) => ({
                              ...item.product,
                              quantity: item.quantity,
                           })),
                        ),
                     },
                  })),
               ),
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

   ordersList.sort(sortOrders);

   const generateBulkFiscalNumber = (
      orderId: OrderModel['id'],
      value: number,
   ) => {
      const filtredOrders = ordersList.filter(
         (order) => order.requiredDocumentType === 'RECEIPT',
      );

      const sortedReceipts = filtredOrders.map((order) => receipts[order.id]);
      const currentReceiptIndex = sortedReceipts
         .map((receipt) => receipt.orderId)
         .indexOf(orderId);

      if (currentReceiptIndex === -1) return;

      const restReceipts = sortedReceipts.slice(currentReceiptIndex + 1);

      restReceipts.forEach((receipt, i) => {
         if (receipt.status === 'RECORDED') return;
         const newValue = value + i + 1;

         setFiscalNumber(receipt.orderId, newValue);
      });
   };

   const selectedOrders = ordersList.filter((order) => order.selected);

   const selectAllHandler = () => {
      const isSelectedAll = selectedOrders.length === ordersList.length;

      if (isSelectedAll) {
         unselectAll();
      } else {
         selectAll();
      }
   };

   const fulfillSelectedOrders = async () => {
      if (!selectedOrders.length) {
         return;
      }

      const selectedOrdersIds = new Set(
         selectedOrders.map((order) => order.id),
      );

      await fulfillOrders([...selectedOrdersIds]);
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
                     onClick={fulfillSelectedOrders}
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
                       <Order
                          id={order.id}
                          onChangeFiscalNumber={(value) => {
                             if (!value) return;

                             generateBulkFiscalNumber(order.id, value);
                          }}
                       />
                       {i + 1 === ordersList.length ? null : <Separator />}
                    </Fragment>
                 ))
               : null}
         </div>
      </div>
   );
}
