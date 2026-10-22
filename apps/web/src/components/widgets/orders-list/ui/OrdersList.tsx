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
} from '@/entities/order';
import { useEffect, useState } from 'react';
import { fetchPendingOrders } from '@/entities/order/api/fetch-pending-orders';
import { Order } from '@/components/features/order';
import { sortOrders } from '../utils/sort-orders';
import { normilizeItems } from '@/entities/offer';
import { CachedScrollWrapper } from '@/components/ui/cached-scroll-wrapper';
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { OrdersListFilters, useOrdersListStore } from '../model/store';
import { useOrdersFilter } from '../model/use-orders-filter';
import { useFulfillOrders } from '@/entities/order';
import { RequiredDocumentTypeFilterSelect } from './required-document-type-filter-select';
import { nonNullable } from 'valibot';
import { isFulfillable } from '@/entities/order';

export function OrdersList() {
   const {
      orders,
      addMany,
      selectAll,
      unselectAll,
      getStatus,
      setDraftFiscalNumber,
      setDraftInvoiceNumber,
   } = useOrdersStore();

   const sortedOrderIds = useOrdersListStore((s) => s.sortedOrderIds);
   const setSortedOrderIds = useOrdersListStore((s) => s.setSortedOrderIds);

   const sortedOrdersList = [...sortedOrderIds].map((id) => orders[id]);

   const currentFilters = useOrdersListStore((s) => s.filters);
   const filter = useOrdersFilter();

   const filtredOrders = filter(sortedOrdersList);
   const filtredOrdersIds = filtredOrders.map((order) => order.id);

   const ordersList = filtredOrders;

   const fulfillOrders = useFulfillOrders(
      [...filtredOrdersIds].filter((id) => isFulfillable(orders[id])),
   );

   useEffect(() => {
      // Update only user refreshes page manually.

      if (Object.values(orders).length) return;
      const promise = fetchPendingOrders();

      promise.then((pendingOrders) => {
         const orders = pendingOrders.map(
            (order): OrderModel => ({
               ...order,
               original: {
                  ...order,
                  createdAt: new Date(order.createdAt),
                  preparedAt: new Date(order.preparedAt),
                  fulfilledAt: order.fulfilledAt
                     ? new Date(order.fulfilledAt)
                     : null,
               },

               receipt: order.receipt
                  ? {
                       original: {
                          ...order.receipt,
                          createdAt: new Date(order.receipt.createdAt),
                       },
                       isRecording: false,
                       draft: { fiscalNumber: null },
                    }
                  : {
                       original: null,
                       isRecording: false,
                       draft: { fiscalNumber: null },
                    },

               invoice: order.invoice
                  ? {
                       original: {
                          ...order.invoice,
                          createdAt: new Date(order.invoice.createdAt),
                       },
                       draft: { number: null },
                       isRecording: false,
                    }
                  : {
                       original: null,
                       draft: { number: null },
                       isRecording: false,
                    },
               isSelected: false,
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
            }),
         );

         addMany(orders);

         setSortedOrderIds(
            new Set(orders.sort(sortOrders).map((order) => order.id)),
         );
      });
   }, []);

   const generateBulkFiscalNumber = (
      orderId: OrderModel['id'],
      value: string,
   ) => {
      const filtredOrders = ordersList.filter(
         (order) => order.requiredDocumentType === 'RECEIPT',
      );

      const currentReceiptIndex = filtredOrders
         .map((order) => order.id)
         .indexOf(orderId);

      if (currentReceiptIndex === -1) return;

      const restOrders = filtredOrders.slice(currentReceiptIndex + 1);

      restOrders.forEach((order, i) => {
         const status = getStatus(order.id);

         if (status !== 'RECORD') {
            return;
         }

         const newValue = Number(value) + i + 1;

         setDraftFiscalNumber(order.id, String(newValue));
      });
   };

   const selectedOrders = ordersList.filter((order) => order.isSelected);

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
         selectedOrders
            .filter((order) => isFulfillable(order))
            .map((order) => order.id),
      );

      if (!selectedOrdersIds.size) return;

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
               <span className="select-none">
                  Select all{' '}
                  {filtredOrdersIds.length && !selectedOrders.length
                     ? `(${filtredOrdersIds.length})`
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
                     disabled={selectedOrders.every(
                        (order) =>
                           getStatus(order.id) === 'RECORDED' ||
                           getStatus(order.id) === 'RECORDING',
                     )}
                  >
                     <ReceiptIcon /> Record selected
                  </Button>
               </>
            ) : null}
            <div className="ml-auto">
               <RequiredDocumentTypeFilterSelect />
            </div>
         </div>
         <Separator />
         <CachedScrollWrapper
            cacheKey={`pending-orders-${currentFilters.requiredDocumentType}`}
            className="overflow-y-scroll min-h-0 flex-1"
         >
            {ordersList.length
               ? ordersList.map((order, i) => (
                    <Fragment key={order.id}>
                       <Order
                          id={order.id}
                          onChangeFiscalNumber={(value) => {
                             if (!value) return;

                             generateBulkFiscalNumber(order.id, String(value));
                          }}
                       />
                       {i + 1 === ordersList.length ? null : <Separator />}
                    </Fragment>
                 ))
               : null}
         </CachedScrollWrapper>
      </div>
   );
}
