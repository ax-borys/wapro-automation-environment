'use client';
import { UpdateFiscalNumber } from '@/components/features/update-fiscal-number';
import { InvoiceNumberBadge, ReceiptNumberBadge } from '@/components/ui/badges';
import { Button } from '@/components/ui/button';
import { DataTableFeatures } from '@/components/ui/data-table/data-table-features';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuPortal,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
   BadgeReceiptNumber,
} from '@/components/ui/receipt-card';
import { Separator } from '@/components/ui/separator';
import {
   ArrowSquareOutIcon,
   CashRegisterIcon,
   LinkIcon,
   PenIcon,
} from '@phosphor-icons/react';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { createColumnHelper } from '@tanstack/react-table';
import { GetReceiptOutput, GetReceiptsInput } from '@wae/receipt';
import { Customer, Invoice, Order, Receipt, Recipient } from '@wae/types';
import currency from 'currency.js';
import { EditIcon, EllipsisVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export type OrderData = {
   id: Order['id'];
   recipient: {
      id: Recipient['id'];
      firstName: Recipient['firstName'];
      lastName: Recipient['lastName'];
      companyName: Recipient['companyName'];
   };
   customer: {
      id: Customer['id'];
      externalId: Customer['externalId'];
   };
   externalId: Order['externalId'];
   packages: Order['packages'];
   receipt: {
      id: Receipt['id'];
      number: Receipt['number'];
      fiscalNumber: Receipt['fiscalNumber'];
   } | null;
   invoice: {
      id: Invoice['id'];
      number: Invoice['number'];
   } | null;
   paymentMethod: Order['paymentMethod'];
   totalToPay: Order['totalToPay'];
   preparedAt: Order['preparedAt'];
   requiredDocumentType: 'INVOICE' | 'RECEIPT';
};

const columnHelper = createColumnHelper<DataTableFeatures, OrderData>();

const formatFullname = (
   firstName?: string | null,
   lastName?: string | null,
   companyName?: string | null,
): string => {
   if (firstName && lastName) return `${firstName} ${lastName}`;
   else if (companyName) return companyName;
   else return 'NAME WAS NOT PROVIDED';
};

export const columns = columnHelper.columns([
   columnHelper.display({
      id: 'link',
      cell: ({ row: r }) => {
         const value = r.original.externalId;

         return (
            <div className="flex flex-col w-fit">
               <Button
                  variant={'ghost'}
                  className="text-blue-700 dark:text-blue-300"
                  asChild
               >
                  <Link
                     className="underline flex items-center justify-center gap-1"
                     href={
                        'https://salescenter.allegro.com/orders?query=' + value
                     }
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <ArrowSquareOutIcon />
                  </Link>
               </Button>
            </div>
         );
      },
      size: 36,
      minSize: 36,
      maxSize: 36,
   }),
   columnHelper.accessor('preparedAt', {
      id: 'preparedAt',
      enableHiding: true,
      sortFn: 'datetime',
   }),
   columnHelper.accessor(
      (r) =>
         formatFullname(
            r?.recipient.firstName,
            r?.recipient.lastName,
            r?.recipient.companyName,
         ),
      {
         id: 'recipient full name',
         header: () => <div className="w-30">Recipient name</div>,
         cell: ({ row: r }) => {
            const value = r.getValue('recipient full name') as string;

            return <div className="w-50 max-w-50 overflow-x-auto">{value}</div>;
         },
         size: 200,
      },
   ),
   columnHelper.accessor('customer.externalId', {
      header: () => <div className="text-left">Buyer external id</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('customer_externalId') as string;

         return <div className="text-left">{value}</div>;
      },
      size: 600,
   }),
   columnHelper.accessor('packages', {
      header: () => <div className="text-center">Packages</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('packages') as number;

         return <div className="text-center">{value}</div>;
      },
      size: 100,
   }),
   columnHelper.accessor((r) => r?.receipt?.number ?? r?.invoice?.number, {
      header: () => <div className="text-center">Number</div>,
      id: 'number',
      cell: ({ row: r }) => {
         const receiptNumber = r.original.receipt?.number;
         const invoiceNumber = r.original.invoice?.number;

         console.log('Original: ', receiptNumber);

         return (
            <div className="text-center">
               {receiptNumber ? (
                  <ReceiptNumberBadge value={receiptNumber} />
               ) : (
                  <InvoiceNumberBadge value={invoiceNumber ?? 'N/D'} />
               )}
            </div>
         );
      },
      size: 150,
   }),
   columnHelper.accessor('receipt.fiscalNumber', {
      header: () => <div className="text-center">Fiscal number</div>,
      cell: ({ row: r }) => {
         const fiscalNumber = r.getValue('receipt_fiscalNumber') as
            | string
            | undefined;

         return (
            <div className="text-center">
               {fiscalNumber ? (
                  <BadgeFiskalNumber value={fiscalNumber} />
               ) : (
                  '---'
               )}
            </div>
         );
      },
      size: 150,
   }),
   columnHelper.accessor('paymentMethod', {
      header: () => <div className="text-center">Payment method</div>,
      cell: ({ row: r }) => {
         const value = r.getValue('paymentMethod') as Order['paymentMethod'];

         return (
            <div className="text-center">
               {value === 'PREPAID' ? <BadgePaid /> : <BadgePickup />}
            </div>
         );
      },
      size: 150,
   }),
   columnHelper.accessor(
      (r) =>
         currency(r.totalToPay, {
            decimal: ',',
            symbol: 'zł',
            pattern: '# !',
            separator: ' ',
            fromCents: true,
         }).format(),
      {
         header: () => <div className="text-right">Total</div>,
         id: 'totalToPay',
         cell: ({ row: r }) => {
            const total = r.getValue('totalToPay') as string;

            return <div className="text-right font-medium">{total}</div>;
         },
         size: 600,
      },
   ),
   columnHelper.display({
      id: 'actions',
      cell: ({ row: r }) => {
         const [selected, setSelected] = useState<'FISCAL_NUMBER' | null>(null);

         const orderId = r.original.id;
         const requiredDocumentType = r.original.requiredDocumentType;

         return (
            <div className="flex flex-col w-full">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant={'ghost'}>
                        <EllipsisVerticalIcon />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onChange={() => {}} className="min-w-40">
                     <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex items-center gap-1">
                           <PenIcon />
                           Edit
                        </DropdownMenuLabel>
                        {orderId ? (
                           <DropdownMenuItem
                              onSelect={() => setSelected('FISCAL_NUMBER')}
                           >
                              <CashRegisterIcon /> Fiscal number
                           </DropdownMenuItem>
                        ) : null}
                     </DropdownMenuGroup>
                  </DropdownMenuContent>
               </DropdownMenu>
               {selected === 'FISCAL_NUMBER' &&
               requiredDocumentType === 'RECEIPT' ? (
                  <UpdateFiscalNumber
                     orderId={orderId}
                     defaultOpen={true}
                     onClosed={() => setSelected(null)}
                  />
               ) : null}
            </div>
         );
      },
      size: 40,
      minSize: 40,
   }),
]);
