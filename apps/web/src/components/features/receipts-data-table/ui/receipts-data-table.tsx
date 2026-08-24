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
import { ColumnVisibilityState, useTable } from '@tanstack/react-table';
import { fetchReceipts } from '@/entities/receipt';

export function ReceiptsDataTable({
   initialData,
}: {
   initialData: ReceiptRecorded[];
}) {
   const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(new Date().toISOString().split('T')[0]),
      to: new Date(new Date().toISOString()),
   });

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

   const table = useTable({
      columns,
      data,
      features,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: 'fuzzy',
      state: {
         columnVisibility,
         globalFilter,
      },
   });

   return (
      <>
         <Toolbar>
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
         <DataTable table={table} />
      </>
   );
}
