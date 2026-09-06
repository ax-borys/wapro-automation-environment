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

export type ReceiptRecorded = {
   order: {
      customer: {
         firstName: string;
         lastName: string;
      };
      packages: GetReceiptOutput['order']['packages'];
      paymentMethod: GetReceiptOutput['order']['paymentMethod'];
      totalPaid: GetReceiptOutput['order']['totalPaid'];
   };
   number: GetReceiptOutput['number'];
   fiscalNumber: GetReceiptOutput['fiscalNumber'];
   createdAt: GetReceiptOutput['createdAt'];
};

const columnHelper = createColumnHelper<DataTableFeatures, ReceiptRecorded>();

export const columns = columnHelper.columns([
   columnHelper.accessor(
      (r) =>
         `${r?.order?.customer?.firstName ?? ''} ${r?.order?.customer?.lastName ?? ''}`,
      {
         id: 'buyerFullName',
         header: () => <div className="w-30">Buyer name</div>,
      },
   ),
   columnHelper.accessor('order.packages', {
      header: () => <div className="text-center">Packages</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('order_packages') as number;

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
      header: () => <div className="text-center">Fiscal number</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('fiscalNumber') as number;

         return (
            <div className="text-center">
               <BadgeFiskalNumber value={value} />
            </div>
         );
      },
   }),
   columnHelper.accessor('order.paymentMethod', {
      header: () => <div className="text-center">Payment method</div>,
      cell: ({ row: r }) => {
         const value = r.getValue(
            'order_paymentMethod',
         ) as ReceiptRecorded['order']['paymentMethod'];

         return (
            <div className="text-center">
               {value === 'PREPAID' ? <BadgePaid /> : <BadgePickup />}
            </div>
         );
      },
   }),
   columnHelper.accessor('order.totalPaid', {
      header: () => <div className="text-right">Total</div>,
      cell: ({ row: r }) => {
         const total = r.getValue('order_totalPaid') as number;
         const formatted = currency(total, {
            decimal: ',',
            symbol: 'zł',
            pattern: '# !',
            separator: ' ',
            fromCents: true,
         }).format();

         return <div className="text-right font-medium">{formatted}</div>;
      },
   }),
]);
