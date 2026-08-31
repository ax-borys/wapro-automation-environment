'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { RowData, useTable } from '@tanstack/react-table';
import { columns, OfferData } from './columns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAllOffersWithItems } from '@/entities/offer/fetch-offers-with-items';
import {
   normilizeItems,
   OfferModel,
   ProductModel,
   useOffersStore,
} from '@/entities/offer';
import {
   Toolbar,
   ToolbarGroup,
   ToolbarSearchbar,
   ToolbarSelectMenu,
   ToolbarSelectMenuCheckboxItem,
} from '@/components/ui/toolbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';

export function OffersDataTable({ initialData }: { initialData: OfferData[] }) {
   const { offers, addMany } = useOffersStore();

   const [initialized, setInitialized] = useState<boolean>(false);

   useEffect(() => {
      const promise = fetchAllOffersWithItems();
      promise.then((offers) => {
         addMany(
            offers.map((offer) => ({
               ...offer,
               items: normilizeItems(offer.items),
            })),
         );
         setInitialized(true);
      });
   }, []);

   const dataInput = useMemo(() => Object.values(offers), [offers]);

   const { globalFilter, table, isMounted, setGlobalFilter } = useDataTable(
      initialized ? dataInput : initialData,
      columns,
   );

   return (
      <div className="flex flex-col h-full max-h-full shrink min-h-0">
         <Toolbar className="flex shrink-0 min-h-0">
            <ToolbarGroup></ToolbarGroup>
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
