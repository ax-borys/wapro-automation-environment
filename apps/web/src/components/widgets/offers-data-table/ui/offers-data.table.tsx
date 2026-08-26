'use client';
import { DataTable, features } from '@/components/ui/data-table';
import { OfferModel } from '@/entities/offer';
import { TableState, useTable } from '@tanstack/react-table';
import { columns } from './columns';

const data: Pick<OfferModel, 'imgSrc' | 'title' | 'approved' | 'items'>[] = [
   {
      imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
      title: 'Geforce RTX 5090',
      items: [],
      approved: true,
   },
   {
      imgSrc: 'http://localhost:8082/public/rtx5080.png',
      title: 'Geforce RTX 5080',
      items: [],
      approved: false,
   },
];
export function OffersDataTable() {
   const table = useTable({
      features,
      data,
      columns: columns,
   });

   return <DataTable table={table} />;
}
