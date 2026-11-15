import { features } from '@/components/ui/data-table';
import type { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import {
   ColumnDef,
   ColumnVisibilityState,
   PaginationState,
   RowData,
   SortingState,
   useTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

export function useDataTable<TData extends RowData>(
   data: TData[],
   columns: ColumnDef<DataTableFeatures, TData>[],
   options?: {
      initialSortingState?: SortingState;
      autoResetPageIndex?: boolean;
      pagination?: {
         pageIndex?: number;
         pageSize?: number;
      };
      columnVisibility?: ColumnVisibilityState;
      resetPaginationDeps?: any[];
   },
) {
   const [date, setDate] = useState<DateRange | undefined>();

   const [columnVisibility, setColumnVisibility] =
      useState<ColumnVisibilityState>(options?.columnVisibility ?? {});

   const [globalFilter, setGlobalFilter] = useState('');

   // fix hydrantion error bug with pageIndex=0
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const [sorting, setSorting] = useState<SortingState>(
      options?.initialSortingState
         ? options.initialSortingState
         : [{ id: 'title', desc: false }],
   );

   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: options?.pagination?.pageIndex ?? 0,
      pageSize: options?.pagination?.pageSize ?? 10,
   });

   useEffect(() => {
      setPagination((s) => ({ ...s, pageIndex: 0 }));
   }, [globalFilter, date, ...(options?.resetPaginationDeps ?? [])]);

   const table = useTable<DataTableFeatures, TData>({
      columns,
      data,
      features,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      autoResetPageIndex: options?.autoResetPageIndex ?? false,
      globalFilterFn: 'fuzzy',
      state: {
         columnVisibility,
         globalFilter,
         sorting,
         pagination,
      },
      initialState: {
         pagination,
      },
      getRowCanExpand: () => true,
   });

   return {
      table,
      date,
      setDate,
      columnVisibility,
      globalFilter,
      isMounted,
      setGlobalFilter,
      setSorting,
   };
}
