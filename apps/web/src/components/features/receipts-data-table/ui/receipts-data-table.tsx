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
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { ColumnVisibilityState, useTable } from '@tanstack/react-table';

export function ReceiptsDataTable({ data }: { data: ReceiptRecorded[] }) {
   const [date, setDate] = useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), 0, 20),
      to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
   });

   const [columnVisibility, setColumnVisibility] =
      useState<ColumnVisibilityState>({});

   const [globalFilter, setGlobalFilter] = useState('');

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
