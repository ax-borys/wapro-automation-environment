'use client';
import { DataTable } from '@/components/ui/data-table';
import { columns, OrderData } from './columns';
import {
   Toolbar,
   ToolbarDatePickerWithRange,
   ToolbarGroup,
   ToolbarSearchbar,
   ToolbarSelectMenu,
   ToolbarSelectMenuCheckboxItem,
} from '@/components/ui/toolbar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, endOfDay, formatISO, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';
import { fetchFulfilledOrders } from '@/entities/order/api/fetch-fulfill-orders';
import { useOrdersStore } from '@/entities/order';
import { useShallow } from 'zustand/shallow';
import { Order } from './order';

export function OrdersDataTable({ initialData }: { initialData: OrderData[] }) {
   const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(),
   });

   const fromTime = date?.from ? startOfDay(date.from).getTime() : 0;
   const toTime = date?.to ? endOfDay(date.to).getTime() : Infinity;

   const satisfiesDateRange = useCallback(
      (time: Date): boolean => {
         const t = time.getTime();

         return t >= fromTime && t <= toTime;
      },
      [fromTime, toTime],
   );

   const orders = useOrdersStore((s) => s.orders);

   const orderList = useMemo(
      () =>
         Object.values(orders).filter(
            (order) =>
               satisfiesDateRange(order.original.createdAt) &&
               order.original.status === 'FULFILLED',
         ),
      [orders, satisfiesDateRange],
   );

   const data = orderList;

   const addOrders = useOrdersStore((s) => s.addMany);

   useEffect(() => {
      const result = fetchFulfilledOrders({
         dateRange: {
            from: date?.from ? formatISO(startOfDay(date?.from)) : null,
            to: date?.to ? formatISO(endOfDay(date?.to)) : null,
         },
      });

      result.then((freshOrders) => {
         const preservedOrders = freshOrders.map((order) => ({
            ...order,
            isSelected:
               orders[order.id] !== undefined
                  ? orders[order.id].isSelected
                  : order.isSelected,
         }));

         addOrders(preservedOrders);
      });
   }, [date]);

   const { globalFilter, table, isMounted, setGlobalFilter } = useDataTable(
      data,
      columns,
      {
         pagination: { pageSize: 20 },
         initialSortingState: [{ id: 'preparedAt', desc: false }],
         columnVisibility: { preparedAt: false },
      },
   );

   return (
      <div className="flex flex-col h-full max-h-full shrink min-h-0">
         <Toolbar className="flex shrink-0 min-h-0">
            <ToolbarGroup>
               <ToolbarDatePickerWithRange date={date} onDateSelect={setDate} />
            </ToolbarGroup>
            <ToolbarGroup className="mx-auto">
               <ToolbarSearchbar
                  value={globalFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                     setGlobalFilter(e.target.value)
                  }
               />
            </ToolbarGroup>
            <ToolbarGroup>
               <ToolbarSelectMenu name="Select columns">
                  {table
                     .getAllColumns()
                     .filter((column) => column.getCanHide())
                     .map((column) => (
                        <ToolbarSelectMenuCheckboxItem
                           key={column.id}
                           className="capitalize"
                           checked={column.getIsVisible()}
                           onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                           }
                        >
                           {column.id}
                        </ToolbarSelectMenuCheckboxItem>
                     ))}
               </ToolbarSelectMenu>
            </ToolbarGroup>
         </Toolbar>
         <div className="flex flex-col h-full max-h-full shrink min-h-0">
            <div className="max-h-full min-h-0  overflow-auto shrink">
               <DataTable
                  table={table}
                  expandedRender={(row) => <Order id={row.original.id} />}
               />
            </div>
            <div className="flex-1 shrink"></div>
            <Toolbar className="shrink-0 border-t border-border bg-background w-full">
               <ToolbarGroup className="mx-auto gap-2">
                  <Button
                     variant={'ghost'}
                     disabled={
                        isMounted ? !table.getCanPreviousPage() : undefined
                     }
                     onClick={table.previousPage}
                  >
                     <ChevronLeft />
                     Previous
                  </Button>
                  {table.state.pagination.pageIndex + 1 > 1 ? (
                     <>
                        <Button
                           variant={'ghost'}
                           className="w-9"
                           onClick={() => table.setPageIndex(0)}
                        >
                           1
                        </Button>
                     </>
                  ) : (
                     <div className="flex justify-center items-center w-9">
                        <Ellipsis className="text-muted-foreground size-4" />
                     </div>
                  )}

                  <Button variant={'outline'} className="w-9">
                     {table.state.pagination.pageIndex + 1}
                  </Button>
                  {table.state.pagination.pageIndex + 1 <
                  table.getPageCount() ? (
                     <>
                        <Button
                           variant={'ghost'}
                           className="w-9"
                           onClick={() =>
                              table.setPageIndex(table.getPageCount() - 1)
                           }
                        >
                           {table.getPageCount()}
                        </Button>
                     </>
                  ) : (
                     <div className="flex justify-center items-center w-9">
                        <Ellipsis className="text-muted-foreground size-4" />
                     </div>
                  )}
                  <Button
                     variant={'ghost'}
                     disabled={isMounted ? !table.getCanNextPage() : undefined}
                     onClick={table.nextPage}
                  >
                     Next
                     <ChevronRight />
                  </Button>
               </ToolbarGroup>
            </Toolbar>
         </div>
      </div>
   );
}
