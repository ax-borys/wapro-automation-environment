'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { RowData, useTable } from '@tanstack/react-table';
import { columns, OfferData } from './columns';
import { useEffect, useRef, useState } from 'react';
import { fetchAllOffersWithItems } from '@/entities/offer/fetch-offers-with-items';
import { OfferModel, ProductModel, useOffersStore } from '@/entities/offer';
import {
   Toolbar,
   ToolbarDatePickerWithRange,
   ToolbarGroup,
   ToolbarSearchbar,
   ToolbarSelectMenu,
   ToolbarSelectMenuCheckboxItem,
} from '@/components/ui/toolbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDataTable } from '@/hooks/use-data-table';

export function OffersDataTable({ initialData }: { initialData: OfferData[] }) {
   const { offers, add } = useOffersStore();

   const initialized = useRef<boolean>(false);

   useEffect(() => {
      const promise = fetchAllOffersWithItems();
      promise.then((offers) => {
         offers.forEach((offer, i) => {
            const items: OfferData['items'] = {};
            offer.items.forEach((i) => (items[i.id] = i));
            add({
               imgSrc: offer.imgSrc,
               title: offer.title,
               active: true,
               approved: offer.approved,
               items,
               id: offer.id,
               externalId: offer.externalId,
               src: offer.src,
            });
         });
         initialized.current = true;
      });
   }, []);

   const dataInput = Object.values(offers);

   const { globalFilter, table, isMounted, setGlobalFilter } = useDataTable(
      initialized.current ? dataInput : initialData,
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
