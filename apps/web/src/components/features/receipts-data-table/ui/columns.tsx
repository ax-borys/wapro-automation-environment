'use client';
import { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
   BadgeReceiptNumber,
} from '@/components/ui/receipt-card';
import { createColumnHelper } from '@tanstack/react-table';
import { GetReceiptOutput } from '@wae/receipt';
import currency from 'currency.js';

export type ReceiptRecorded = GetReceiptOutput;

const columnHelper = createColumnHelper<DataTableFeatures, ReceiptRecorded>();

export const columns = columnHelper.columns([
   columnHelper.accessor(
      (r) => `${r.recipientFirstName} ${r.recipientLastName}`,
      {
         id: 'buyerFullName',
         header: () => <div className="w-30">Buyer name</div>,
      },
   ),
   columnHelper.accessor('packagesMade', {
      header: () => <div className="text-center">Packages</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('packagesMade') as number;

         return <div className="text-center">{value}</div>;
      },
   }),
   columnHelper.accessor('number', {
      header: () => <div className="text-center">Number</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('number') as number;

         return (
            <div className="text-center">
               <BadgeReceiptNumber value={value.toString()} />
            </div>
         );
      },
   }),
   columnHelper.accessor('fiscalNumber', {
      header: () => <div className="text-center">Fiskal number</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('fiscalNumber') as number;

         return (
            <div className="text-center">
               <BadgeFiskalNumber
                  value={'W' + String(value).padStart(6, '0')}
               />
            </div>
         );
      },
   }),
   columnHelper.accessor('paymentMethod', {
      header: () => <div className="text-center">Payment method</div>,
      cell: ({ row: r }) => {
         const value = r.getValue(
            'paymentMethod',
         ) as ReceiptRecorded['paymentMethod'];

         return (
            <div className="text-center">
               {value === 'PREPAID' ? <BadgePaid /> : <BadgePickup />}
            </div>
         );
      },
   }),
   columnHelper.accessor('totalPaid', {
      header: () => <div className="text-right">Total</div>,
      cell: ({ row: r }) => {
         const total = r.getValue('totalPaid') as number;
         const formatted = currency(total, {
            decimal: ',',
            symbol: 'zł',
            pattern: '# !',
            separator: ' ',
         }).format();

         return <div className="text-right font-medium">{formatted}</div>;
      },
   }),
]);
