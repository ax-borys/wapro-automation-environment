'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { columns, ReceiptRecorded } from './columns';
import {
   Toolbar,
   ToolbarDatePickerWithRange,
   ToolbarGroup,
   ToolbarSearchbar,
   ToolbarSelectMenu,
   ToolbarSelectMenuCheckboxItem,
} from '@/components/ui/toolbar';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, endOfDay, formatISO, startOfDay } from 'date-fns';
import {
   ColumnVisibilityState,
   PaginationState,
   useTable,
} from '@tanstack/react-table';
import { fetchReceipts } from '@/entities/receipt';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ReceiptsDataTable({
   initialData,
}: {
   initialData: ReceiptRecorded[];
}) {
   const [date, setDate] = useState<DateRange | undefined>();

   const [columnVisibility, setColumnVisibility] =
      useState<ColumnVisibilityState>({});

   const [globalFilter, setGlobalFilter] = useState('');

   const [data, setData] = useState<ReceiptRecorded[]>(initialData);

   useEffect(() => {
      const result = fetchReceipts({
         dateRange: {
            from: date?.from ? formatISO(startOfDay(date?.from)) : null,
            to: date?.to ? formatISO(endOfDay(date?.to)) : null,
         },
      });

      result.then((r) => (!r.error ? setData(r.data) : null));
   }, [date]);

   // fix hydrantion error bug with pageIndex=0
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const table = useTable({
      columns,
      data,
      features,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: 'fuzzy',
      initialState: {
         pagination: {
            pageIndex: 0,
            pageSize: 10,
         },
      },
      state: {
         columnVisibility,
         globalFilter,
      },
   });

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
               <DataTable table={table} />
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
                  {[...new Array(table.getPageCount())].map((_, i) => (
                     <Button
                        key={i}
                        variant={
                           table.state.pagination.pageIndex === i
                              ? 'outline'
                              : 'ghost'
                        }
                        onClick={() => table.setPageIndex(i)}
                     >
                        {i + 1}
                     </Button>
                  ))}
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
