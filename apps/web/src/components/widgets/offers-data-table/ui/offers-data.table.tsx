'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { useTable } from '@tanstack/react-table';
import { columns, OfferData } from './columns';
import { useEffect, useState } from 'react';
import { fetchAllOffersWithItems } from '@/entities/offer/fetch-offers-with-items';

export function OffersDataTable() {
   const [data, setData] = useState<OfferData[]>([]);

   useEffect(() => {
      const promise = fetchAllOffersWithItems();
      promise.then((offers) =>
         setData(
            offers.map((offer) => ({
               imgSrc: offer.imgSrc,
               title: offer.title,
               active: false,
               approved: false,
               items: offer.items,
            })),
         ),
      );
   }, []);

   const table = useTable({
      features,
      data,
      columns: columns,
   });

   return <DataTable table={table} />;
}
