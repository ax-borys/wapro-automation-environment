'use client';
import { EditFiscalNumber } from '@/components/features/edit-fiscal-number/ui/edit-fiscal-number';
import { Button } from '@/components/ui/button';
import { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
   BadgeReceiptNumber,
} from '@/components/ui/receipt-card';
import { createColumnHelper } from '@tanstack/react-table';
import { GetReceiptOutput, GetReceiptsInput } from '@wae/receipt';
import { Customer, Order, Receipt } from '@wae/types';
import currency from 'currency.js';
import { EditIcon } from 'lucide-react';
import Link from 'next/link';

export type ReceiptRecorded = {
   id: Receipt['id'];
   order: {
      externalId: Order['externalId'];
      customer: {
         externalId: Customer['externalId'];
         firstName: string | null | undefined;
         lastName: string | null | undefined;
         companyName: string | null | undefined;
      };
      packages: GetReceiptOutput['order']['packages'];
      paymentMethod: GetReceiptOutput['order']['paymentMethod'];
      totalPaid: GetReceiptOutput['order']['totalPaid'];
      totalToPay: GetReceiptOutput['order']['totalToPay'];
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
         size: 200,
      },
   ),
   columnHelper.accessor('order.customer.externalId', {
      header: () => <div className="text-center">Customer external id</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('order_customer_externalId') as string;

         return <div className="text-center">{value}</div>;
      },
      size: 100,
   }),
   columnHelper.accessor('order.externalId', {
      header: () => <div className="text-center">External id</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('order_externalId') as string;

         return (
            <div className="text-center">
               <Link
                  className="underline"
                  href={'https://salescenter.allegro.com/orders?query=' + value}
                  target="_blank"
               >
                  {value}
               </Link>
            </div>
         );
      },
      size: 100,
   }),
   columnHelper.accessor('order.packages', {
      header: () => <div className="text-center">Packages</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('order_packages') as number;

         return <div className="text-center">{value}</div>;
      },
      size: 100,
   }),
   columnHelper.accessor('number', {
      header: () => <div className="text-center">Number</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('number') as string;

         return (
            <div className="text-center">
               <Button
                  onClick={() => navigator.clipboard.writeText(value)}
                  className="bg-transparent hover:bg-transparent cursor-pointer px-0"
               >
                  <BadgeReceiptNumber value={value} />
               </Button>
            </div>
         );
      },
      size: 150,
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
      size: 150,
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
      size: 150,
   }),
   columnHelper.accessor('order.totalToPay', {
      header: () => <div className="text-right">Total</div>,
      cell: ({ row: r }) => {
         const total = r.getValue('order_totalToPay') as number;
         const formatted = currency(total, {
            decimal: ',',
            symbol: 'zł',
            pattern: '# !',
            separator: ' ',
            fromCents: true,
         }).format();

         return <div className="text-right font-medium">{formatted}</div>;
      },
      size: 200,
   }),
   columnHelper.display({
      id: 'edit',
      cell: ({ row: r }) => {
         return (
            <div className="flex flex-col w-full">
               <EditFiscalNumber
                  receiptId={1}
                  trigger={
                     <Button variant={'ghost'}>
                        <EditIcon />
                     </Button>
                  }
               />
            </div>
         );
      },
      size: 40,
      minSize: 40,
   }),
]);
