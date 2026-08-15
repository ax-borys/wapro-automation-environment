'use client';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Checkbox } from './checkbox';
import {
   Table,
   TableBody,
   TableHead,
   TableHeader,
   TableRow,
   TableCell,
   TableCaption,
   TableFooter,
} from './table';
import { Badge } from './badge';
import { Button } from './button';
import { Separator } from './separator';
import { BadgeCheck } from 'lucide-react';
import {
   HandCoinsIcon,
   ReceiptIcon,
   SealCheckIcon,
   User,
   UserIcon,
} from '@phosphor-icons/react';
import {
   Item,
   ItemContent,
   ItemMedia,
   ItemTitle,
   ItemActions,
   ItemDescription,
} from './item';
import { cn } from '@/lib/utils';
import currency from 'currency.js';

export function BadgePaid({ ...props }: React.ComponentProps<typeof Badge>) {
   return (
      <Badge className="ml-auto text-sm p-4 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
         <SealCheckIcon className="size-4!" />
         Paid
      </Badge>
   );
}

export function BadgePickup({ ...props }: React.ComponentProps<typeof Badge>) {
   return (
      <Badge className="ml-auto p-4 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
         <HandCoinsIcon className="size-4!" />
         Pickup
      </Badge>
   );
}

export function ReceiptCard({
   className,
   ...props
}: React.ComponentProps<typeof Card>) {
   return <Card className={cn('ring-0 shadow-none', className)} {...props} />;
}

export function ReceiptCardHeader({
   className,
   children,
   ...props
}: React.ComponentProps<typeof CardHeader>) {
   return (
      <CardHeader
         className={cn('flex items-center gap-4', className)}
         {...props}
      >
         {children}
      </CardHeader>
   );
}

export function ReceiptCardBody({
   className,
   children,
   ...props
}: React.ComponentProps<typeof CardHeader>) {
   return (
      <CardContent className={cn(className)} {...props}>
         {children}
      </CardContent>
   );
}

export function ReceiptCardTable({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Table>) {
   return (
      <Table className={cn('table-fixed max-w-[75vw]', className)} {...props}>
         {children}
      </Table>
   );
}

export function ReceiptCardTableHeader({
   ...props
}: React.ComponentProps<typeof TableHeader>) {
   return (
      <TableHeader {...props}>
         <TableRow>
            <TableHead className="w-auto">Name</TableHead>
            <TableHead className="w-20 text-right">Quantity</TableHead>
            <TableHead className="w-20 text-center">Vat</TableHead>
            <TableHead className="w-30 text-right ">Netto</TableHead>
            <TableHead className="w-30 text-right">Brutto</TableHead>
         </TableRow>
      </TableHeader>
   );
}

export function ReceiptCardTableFooter({
   totalNet,
   totalGross,
   ...props
}: React.ComponentProps<typeof TableFooter> & {
   totalNet: number;
   totalGross: number;
}) {
   return (
      <TableFooter {...props}>
         <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
               {currency(totalNet, {
                  decimal: ',',
                  pattern: '# !',
                  symbol: 'zł',
               }).format()}
            </TableCell>
            <TableCell className="text-right">
               {currency(totalGross, {
                  decimal: ',',
                  pattern: '# !',
                  symbol: 'zł',
               }).format()}
            </TableCell>
         </TableRow>
      </TableFooter>
   );
}

export function ReceiptCardTableBody({
   children,
   ...props
}: React.ComponentProps<typeof TableBody>) {
   return <TableBody>{children}</TableBody>;
}

export function ReceiptCardTablePosition({
   className,
   imgSrc,
   name,
   quantity,
   tax,
   net,
   gross,
   ...props
}: React.ComponentProps<typeof TableRow> & {
   imgSrc: string;
   name: string;
   quantity: number;
   tax: '8' | '23';
   net: number;
   gross: number;
}) {
   return (
      <TableRow className={cn(className)} {...props}>
         <TableCell className="font-medium text-sm flex items-center gap-2">
            <Image src={imgSrc} alt="Product preview" width={30} height={30} />
            <div className="overflow-scroll">{name}</div>
         </TableCell>
         <TableCell className="text-center">x{quantity}</TableCell>
         <TableCell className="text-center">{Number.parseInt(tax)}%</TableCell>
         <TableCell className="text-right">
            {currency(net, {
               decimal: ',',
               pattern: '# !',
               symbol: 'zł',
            }).format()}
         </TableCell>
         <TableCell className="text-right">
            {currency(gross, {
               decimal: ',',
               pattern: '# !',
               symbol: 'zł',
            }).format()}
         </TableCell>
      </TableRow>
   );
}

export function ReceiptCardFooter({
   buyerFullname,
   orderProcessedAt,
   onActionClick,
   ...props
}: React.ComponentProps<typeof CardFooter> & {
   buyerFullname: string;
   orderProcessedAt: string;
   onActionClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
   return (
      <CardFooter {...props}>
         <Item>
            <ItemMedia variant={'icon'}>
               <UserIcon />
            </ItemMedia>
            <ItemContent>
               <ItemTitle>{buyerFullname}</ItemTitle>
               <ItemDescription>{orderProcessedAt}</ItemDescription>
            </ItemContent>
            <ItemActions>
               <Button onClick={onActionClick}>
                  <ReceiptIcon /> Record a receipt
               </Button>
            </ItemActions>
         </Item>
      </CardFooter>
   );
}
