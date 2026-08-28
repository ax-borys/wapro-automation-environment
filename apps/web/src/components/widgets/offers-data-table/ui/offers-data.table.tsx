'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { OfferModel } from '@/entities/offer';
import { useTable } from '@tanstack/react-table';
import { columns, OfferData } from './columns';
import { useEffect, useState } from 'react';
import { fetchOffers } from '@/entities/offer/fetch-offers';
import { setDate } from 'date-fns';
import { Offer } from '@wae/offer';

export function OffersDataTable() {
   const [data, setData] = useState<OfferData[]>([]);

   useEffect(() => {
      const promise = fetchOffers();
      promise.then((offers) =>
         setData(
            offers.map((offer) => ({
               imgSrc: offer.imgSrc,
               title: offer.title,
               active: false,
               approved: false,
               items: [],
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
