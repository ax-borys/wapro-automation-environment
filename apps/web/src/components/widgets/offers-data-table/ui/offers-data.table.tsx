'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { useTable } from '@tanstack/react-table';
import { columns, OfferData } from './columns';
import { useEffect, useState } from 'react';
import { fetchAllOffersWithItems } from '@/entities/offer/fetch-offers-with-items';
import { useOffersStore } from '@/entities/offer';

export function OffersDataTable() {
   const { offers, add } = useOffersStore();

   useEffect(() => {
      const promise = fetchAllOffersWithItems();
      promise.then((offers) => {
         offers.forEach((offer) => {
            const items: OfferData['items'] = {};
            offer.items.forEach((i) => (items[i.id] = i));

            add({
               imgSrc: offer.imgSrc,
               title: offer.title,
               active: false,
               approved: false,
               items,
               id: offer.id,
               externalId: offer.externalId,
               src: offer.src,
            });
         });
      });
   }, []);

   const table = useTable({
      features,
      data: Object.values(offers),
      columns: columns,
   });

   return <DataTable table={table} />;
}
