'use client';

import { Fragment } from 'react/jsx-runtime';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileTextIcon, ReceiptIcon } from '@phosphor-icons/react';
import {
   OrderModel,
   useFetchPendingOrders,
   useOrdersStore,
} from '@/entities/order';
import { useEffect, useMemo, useState } from 'react';
import { Order } from './order';
import { sortOrders } from '../utils/sort-orders';
import { CachedScrollWrapper } from '@/components/ui/cached-scroll-wrapper';
import { useOrdersListStore } from '../model/store';
import { useOrdersFilter } from '../model/use-orders-filter';
import { useFulfillOrders } from '@/entities/order';
import { RequiredDocumentTypeFilterSelect } from './required-document-type-filter-select';
import { isFulfillable } from '@/entities/order';
import { useGetAndStoreOffers } from '@/entities/offer/hooks/use-get-and-store-offers';
import { useDataTable } from '@/hooks/use-data-table';
import { columns } from './columns';
import {
   Empty,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from '@/components/ui/empty';
import {
   Toolbar,
   ToolbarGroup,
   ToolbarPaginationPanel,
   ToolbarSearchbar,
} from '@/components/ui/toolbar';

export function OrdersList() {
   const {
      orders,
      addMany,
      selectMany,
      unselectMany,
      getStatus,
      setDraftFiscalNumber,
   } = useOrdersStore();

   const sortedOrderIds = useOrdersListStore((s) => s.sortedOrderIds);
   const setSortedOrderIds = useOrdersListStore((s) => s.setSortedOrderIds);
   const sortedOrdersList = [...sortedOrderIds].map((id) => orders[id]);

   const currentFilters = useOrdersListStore((s) => s.filters);
   const filter = useOrdersFilter();

   const filtredOrders = filter(sortedOrdersList);
   const filtredOrdersIds = filtredOrders.map((order) => order.id);

   const ordersList = useMemo(() => filtredOrders, [orders, currentFilters]);

   const { table, isMounted, globalFilter, setGlobalFilter } = useDataTable(
      ordersList,
      columns,
      {
         autoResetPageIndex: false,
         pagination: { pageSize: 20 },
         resetPaginationDeps: [currentFilters],
      },
   );

   const fulfillOrders = useFulfillOrders(
      [...filtredOrdersIds].filter((id) => isFulfillable(orders[id])),
   );

   const fetchPendingOrders = useFetchPendingOrders(orders);

   useGetAndStoreOffers();

   useEffect(() => {
      // Update only user refreshes page manually.
      if (sortedOrdersList.length) return;

      const promise = fetchPendingOrders();

      promise.then((pendingOrders) => {
         const orders = pendingOrders;

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

         setDraftFiscalNumber(order.id, newValue);
      });
   };

   const ordersOfCurrentPage = table
      .getRowModel()
      .rows.flatMap((row) =>
         row.getVisibleCells().map((cell) => orders[cell.row.original.id]),
      );

   const idsOfCurrentPage = [
      ...new Set(ordersOfCurrentPage.map((order) => order.id)),
   ];
   const selectedOrders = ordersOfCurrentPage.filter(
      (order) => order.isSelected,
   );
   const selectedOrdersIds = selectedOrders.map((order) => order.id);
   const isSelectedAll = selectedOrders.length === ordersOfCurrentPage.length;

   const selectAllHandler = () => {
      if (isSelectedAll) {
         unselectMany(selectedOrdersIds);
      } else {
         selectMany(idsOfCurrentPage);
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

   console.log(
      typeof window === 'undefined' ? 'SERVER' : 'CLIENT',
      JSON.stringify(table.state.pagination),
      table.getRowModel().rows.length,
      table.getPageCount(),
      'canNext=',
      table.getCanNextPage(),
   );

   const [hasHydrated, setHasHydrated] = useState(false);
   useEffect(() => {
      setHasHydrated(true);
   }, []);

   return (
      <div className="flex-1 min-h-0 flex flex-col">
         <Toolbar>
            <ToolbarGroup className="w-40">
               <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={selectAllHandler}
               >
                  <Checkbox
                     checked={isSelectedAll}
                     className="cursor-pointer"
                  />
                  <span className="select-none text-muted-foreground text-sm whitespace-nowrap">
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
                        className="h-4 translate-y-2"
                     />
                     <span className="text-muted-foreground text-sm">
                        {selectedOrders.length}
                     </span>
                     <Separator
                        orientation="vertical"
                        className="h-4 translate-y-2"
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
            </ToolbarGroup>
            <ToolbarGroup>
               <ToolbarSearchbar
                  value={globalFilter}
                  onSearch={(value) => setGlobalFilter(value)}
               />
            </ToolbarGroup>
            <ToolbarGroup>
               <RequiredDocumentTypeFilterSelect />
            </ToolbarGroup>
         </Toolbar>
         <CachedScrollWrapper
            cacheKey={`pending-orders-${currentFilters.requiredDocumentType}`}
            className="overflow-y-scroll min-h-0 flex-1"
         >
            {ordersOfCurrentPage.length ? (
               ordersOfCurrentPage.map((order, i) => (
                  <Fragment key={order.id}>
                     <Order
                        id={order.id}
                        onChangeFiscalNumber={(value) => {
                           if (!value) return;

                           generateBulkFiscalNumber(order.id, String(value));
                        }}
                     />
                     {i + 1 === table.getRowModel().rows.length ? null : (
                        <Separator />
                     )}
                  </Fragment>
               ))
            ) : (
               <Empty>
                  <EmptyHeader>
                     <EmptyMedia variant={'icon'}>
                        <FileTextIcon />
                     </EmptyMedia>
                     <EmptyTitle>No records found</EmptyTitle>
                     <EmptyDescription>
                        Unfortunatly, no records matched filters.
                     </EmptyDescription>
                  </EmptyHeader>
               </Empty>
            )}
         </CachedScrollWrapper>
         <Toolbar className="shrink-0 border-t border-border bg-background w-full">
            <ToolbarPaginationPanel
               className="mx-auto gap-2"
               onNext={() => table.nextPage()}
               onPrevious={() => table.previousPage()}
               isNextPageAvailable={table.getCanNextPage()}
               isPreviousPageAvailable={table.getCanPreviousPage()}
               onPage={(index) => table.setPageIndex(index)}
               totalPageCount={table.getPageCount()}
               currentPageIndex={table.state.pagination.pageIndex}
               onReset={() => table.resetPagination()}
            />
         </Toolbar>
      </div>
   );
}
