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
import { useEffect, useState } from 'react';
import { fetchPendingOrders } from '@/entities/order/api/fetch-pending-orders';
import { Order } from '@/components/features/order';
import { sortOrders, useFulfillOrders } from '@/entities/order';
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

type RequiredDocumentTypeFilter = OrderModel['requiredDocumentType'] | 'ALL';

function RequiredDocumentTypeFilterSelect({
   items,
   ...props
}: React.ComponentProps<typeof Select> & {
   items: { label: string; value: RequiredDocumentTypeFilter }[];
}) {
   return (
      <Select {...props}>
         <SelectTrigger className="w-30">
            <SelectValue placeholder="Document" />
         </SelectTrigger>
         <SelectContent>
            <SelectGroup>
               {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                     {item.label}
                  </SelectItem>
               ))}
            </SelectGroup>
         </SelectContent>
      </Select>
   );
}

export function OrdersList() {
   const { orders, addMany, selectAll, unselectAll } = useOrdersStore();

   const [sortedOrderIds, setSortedOrderIds] = useState<Set<OrderModel['id']>>(
      new Set(Object.values(orders).map((order) => order.id)),
   );

   const [filters, setFilters] = useState<{
      requiredDocumentType: RequiredDocumentTypeFilter;
   }>({ requiredDocumentType: 'ALL' });

   const filter = (orderIds: number[]) => {
      return orderIds.filter((id) => {
         const order = orders[id];

         if (filters.requiredDocumentType !== 'ALL') {
            if (order.requiredDocumentType !== filters.requiredDocumentType) {
               return false;
            }

            return true;
         }
         ``;
         return true;
      });
   };

   const filtredOrderIds = filter([...sortedOrderIds]);

   const {
      receipts,
      addMany: addManyReceipts,
      setFiscalNumber,
   } = useReceiptsStore();

   const fulfillOrders = useFulfillOrders(
      [...filtredOrderIds].filter(
         (id) =>
            !orders[id].receipt?.id &&
            orders[id].receipt?.number &&
            orders[id].invoice.status === 'RECORD' &&
            orders[id].invoice.number,
      ),
   );

   const ordersList = [...filtredOrderIds].map((id) => orders[id]);

   useEffect(() => {
      // Update only user refreshes page manually.

      if (Object.values(orders).length) return;
      const promise = fetchPendingOrders();

      promise.then((pendingOrders) => {
         const orders = pendingOrders.map(
            (order): OrderModel => ({
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
            }),
         );

         addMany(orders);

         setSortedOrderIds(
            new Set(orders.sort(sortOrders).map((order) => order.id)),
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
         selectedOrders
            .filter((order) => receipts[order.id].status === 'RECORD')
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
                  {filtredOrderIds.length && !selectedOrders.length
                     ? `(${filtredOrderIds.length})`
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
            <div className="ml-auto">
               <RequiredDocumentTypeFilterSelect
                  value={filters.requiredDocumentType}
                  onValueChange={(v) =>
                     setFilters({
                        ...filters,
                        requiredDocumentType: v as RequiredDocumentTypeFilter,
                     })
                  }
                  items={[
                     { label: 'All', value: 'ALL' },
                     { label: 'Receipt', value: 'RECEIPT' },
                     { label: 'Invoice', value: 'INVOICE' } as const,
                  ]}
               />
            </div>
         </div>
         <Separator />
         <CachedScrollWrapper
            cacheKey="pending-orders"
            className="overflow-y-scroll min-h-0 flex-1"
         >
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
         </CachedScrollWrapper>
      </div>
   );
}
