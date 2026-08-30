import { features } from '@/components/ui/data-table';
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import {
   ColumnDef,
   ColumnVisibilityState,
   RowData,
   useTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

export function useDataTable<TData extends RowData>(
   data: TData[],
   columns: ColumnDef<DataTableFeatures, TData>[],
) {
   const [date, setDate] = useState<DateRange | undefined>();

   const [columnVisibility, setColumnVisibility] =
      useState<ColumnVisibilityState>({});

   const [globalFilter, setGlobalFilter] = useState('');

   // fix hydrantion error bug with pageIndex=0
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const table = useTable<DataTableFeatures, TData>({
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

   return {
      table,
      date,
      setDate,
      columnVisibility,
      globalFilter,
      isMounted,
      setGlobalFilter,
   };
}
