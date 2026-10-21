import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import {
   Table,
   TableBody,
   TableHead,
   TableHeader,
   TableRow,
   TableCell,
   TableFooter,
} from './table';
import { Badge } from './badge';
import {
   CashRegisterIcon,
   CopyIcon,
   HandCoinsIcon,
   Icon,
   InvoiceIcon,
   LinkIcon,
   PackageIcon,
   SealCheckIcon,
   SpinnerIcon,
   TruckIcon,
   UserIcon,
   XIcon,
} from '@phosphor-icons/react';
import {
   Item,
   ItemContent,
   ItemMedia,
   ItemTitle,
   ItemDescription,
} from './item';
import { cn } from '@/lib/utils';
import currency from 'currency.js';
import React from 'react';
import { Address } from '@wae/types';
import { OfferModel, ProductModel } from '@/entities/offer';
import { OrderModel, PositionModel } from '@/entities/order';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import Link from 'next/link';
import { Button } from './button';
import { Marker, MarkerContent, MarkerIcon } from './marker';

const formatPln = (value: currency.Any) =>
   currency(value, {
      decimal: ',',
      separator: ' ',
      pattern: '# !',
      symbol: 'zł',
   }).format();

export function BadgePaid({
   className,
   ...props
}: React.ComponentProps<typeof Badge>) {
   return (
      <Badge
         className={cn(
            'ml-auto text-sm p-4 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
            className,
         )}
      >
         <SealCheckIcon className="size-4!" />
         Paid
      </Badge>
   );
}

export function BadgePickup({ ...props }: React.ComponentProps<typeof Badge>) {
   return (
      <Badge className="ml-auto p-4 text-sm bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
         <HandCoinsIcon className="size-4!" />
         Pickup
      </Badge>
   );
}

export function BadgeReceiptNumber({
   value,
   ...props
}: React.ComponentProps<typeof Badge> & {
   value: string;
}) {
   return (
      <Badge className="ml-auto p-4 underline font-medium bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
         <CopyIcon className="size-4!" />
         {value}
      </Badge>
   );
}

export function BadgeFiskalNumber({
   value,
   ...props
}: React.ComponentProps<typeof Badge> & {
   value: number | string;
}) {
   return (
      <Badge className="ml-auto p-4 font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
         <CashRegisterIcon className="size-4!" />
         {value}
      </Badge>
   );
}

export function OrderCard({
   className,
   ...props
}: React.ComponentProps<typeof Card>) {
   return <Card className={cn('ring-0 shadow-none', className)} {...props} />;
}

export function OrderCardHeader({
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

export function OrderCardBody({
   className,
   children,
   ...props
}: React.ComponentProps<typeof CardContent>) {
   return (
      <CardContent className={cn(className)} {...props}>
         {children}
      </CardContent>
   );
}

export function OrderCardTable({
   className,
   children,
   ...props
}: React.ComponentProps<typeof Table>) {
   return (
      <Table className={cn('table-fixed max-w-full', className)} {...props}>
         {children}
      </Table>
   );
}

export function OrderCardTableHeader({
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

export function OrderCardTableFooter({
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
            <TableCell className="text-right">{formatPln(totalNet)}</TableCell>
            <TableCell className="text-right">
               {formatPln(totalGross)}
            </TableCell>
         </TableRow>
      </TableFooter>
   );
}

export function OrderCardTableBody({
   children,
   ...props
}: React.ComponentProps<typeof TableBody>) {
   return <TableBody>{children}</TableBody>;
}

export function OrderCardTablePosition({
   className,
   position,
   editOfferComp,
   offer,
   ...props
}: React.ComponentProps<typeof TableRow> & {
   position: Omit<PositionModel, 'offer'>;
   editOfferComp: React.ReactElement;
   offer: OfferModel;
}) {
   const isOfferLinked = !!Object.values(offer.items).length;
   const items = Object.values(offer.items);

   const calculateTax = (offer: OfferModel): ProductModel['tax'] => {
      const taxes = new Set(Object.values(offer.items).map((i) => i.tax));
      return taxes.size === 1 ? [...taxes][0] : 0;
   };

   const tax = calculateTax(offer);

   const gross = currency(position.price, { fromCents: true }).value;

   const net = currency(position.price, {
      fromCents: true,
   }).divide((100 + (tax / 100) * 100) / 100).value;

   const fromAllegro =
      offer.src === 'allegro' && offer.externalId !== 'delivery';

   const allegroOfferUrl = `https://salescenter.allegro.com/my-assortment?limit=20&phrase=${offer.externalId}&sellingMode.format=BUY_NOW&context.marketplace=allegro-pl`;

   return (
      <TableRow className={cn(className)} {...props}>
         <TableCell className="font-medium text-sm flex items-center gap-2">
            <>
               {isOfferLinked ? (
                  <Tooltip>
                     <TooltipContent>
                        {items.map((item) => (
                           <span
                              key={item.id}
                              className="flex items-center gap-2"
                           >
                              {item.name}
                              <XIcon />
                              {item.quantity}
                           </span>
                        ))}
                     </TooltipContent>
                     <TooltipTrigger
                        asChild
                        className="flex items-center gap-2"
                     >
                        <Link
                           href={
                              fromAllegro ? allegroOfferUrl : '#pending-orders'
                           }
                           target={fromAllegro ? '_blank' : '_self'}
                           rel={'noopener noreferrer'}
                        >
                           {offer.externalId === 'delivery' ? (
                              <TruckIcon className="size-6 mx-0.75" />
                           ) : (
                              <Image
                                 src={offer.imgSrc}
                                 alt=""
                                 width={30}
                                 height={30}
                                 className="rounded-sm"
                              />
                           )}
                           <div className="overflow-auto border-primary border-b border-dashed">
                              {offer.title}
                           </div>
                           <LinkIcon />
                        </Link>
                     </TooltipTrigger>
                  </Tooltip>
               ) : (
                  <>
                     <Link
                        href={
                           offer.src === 'allegro' &&
                           offer.externalId !== 'delivery'
                              ? allegroOfferUrl
                              : '#pending-orders'
                        }
                        className="flex items-center gap-2"
                        target={fromAllegro ? '_blank' : '_self'}
                        rel={'noopener noreferrer'}
                     >
                        {offer.externalId === 'delivery' ? (
                           <TruckIcon className="size-6 mx-0.75" />
                        ) : (
                           <Image
                              src={offer.imgSrc}
                              alt="Product preview"
                              width={30}
                              height={30}
                              className="rounded-sm"
                           />
                        )}
                        <div className="overflow-auto">{offer.title}</div>
                     </Link>
                     {editOfferComp}
                  </>
               )}
            </>
         </TableCell>
         <TableCell className="text-center">x{position.quantity}</TableCell>
         <TableCell className="text-center">{tax}%</TableCell>
         <TableCell className="text-right">{formatPln(net)}</TableCell>
         <TableCell className="text-right">{formatPln(gross)}</TableCell>
      </TableRow>
   );
}

export function OrderCardFooter({
   children,
   ...props
}: React.ComponentProps<typeof CardFooter>) {
   return (
      <CardFooter className="flex justify-between" {...props}>
         {children}
      </CardFooter>
   );
}

export function OrderCardRecipient({
   recipientFullName,
   orderProcessedAt,
}: {
   recipientFullName: string;
   orderProcessedAt: string;
}) {
   return (
      <Item className="w-60">
         <ItemMedia variant={'icon'}>
            <UserIcon />
         </ItemMedia>
         <ItemContent>
            <ItemTitle>{recipientFullName}</ItemTitle>
            <ItemDescription>{orderProcessedAt}</ItemDescription>
         </ItemContent>
      </Item>
   );
}

export function OrderCardFooterActions({
   children,
   className,
   ...props
}: React.ComponentProps<'div'>) {
   return (
      <div className={cn('flex gap-2 w-60 justify-end')} {...props}>
         {children}
      </div>
   );
}
export function OrderCardDeliveryCard({
   title,
   address,
   className,
   ...props
}: React.ComponentProps<typeof Item> & {
   title: string;
   address: Omit<Address, 'id' | 'clientTag'>;
}) {
   return (
      <Item className={cn('w-100', className)} {...props}>
         <ItemMedia variant={'icon'}>
            <TruckIcon />
         </ItemMedia>
         <ItemContent>
            <ItemTitle>{title}</ItemTitle>
            <ItemDescription>
               <span className="block">{address.street}</span>
               <span className="block">
                  {address.postalCode} {address.city} {address.countryCode}
               </span>
            </ItemDescription>
         </ItemContent>
      </Item>
   );
}

export function OrderCardPackage({
   numberOfPackages,
   className,
   ...props
}: React.ComponentProps<typeof Item> & {
   numberOfPackages: number;
}) {
   return (
      <Item className={cn('w-50 mb-auto', className)} {...props}>
         <ItemMedia variant={'icon'}>
            <PackageIcon />
         </ItemMedia>
         <ItemContent>
            <ItemTitle>
               {numberOfPackages}
               <span className="font-normal">
                  {numberOfPackages === 1 ? 'package' : 'packages'}
               </span>
            </ItemTitle>
         </ItemContent>
      </Item>
   );
}

type Appearance = { icon: React.ReactNode; label: React.ReactNode };

export function OrderCardActionButton({
   status,
   idle,
   pending,
   done,
   ...props
}: Omit<React.ComponentProps<typeof Button>, 'children'> & {
   status: 'RECORD' | 'RECORDED' | 'RECORDING';
   idle: Appearance;
   pending: Appearance & { spin?: boolean };
   done: Appearance;
}) {
   if (status === 'RECORD') {
      return (
         <Button {...props}>
            {idle.icon}
            {idle.label}
         </Button>
      );
   }

   const isPending = status === 'RECORDING';
   const { icon, label } = isPending ? pending : done;
   const spin = !!pending.spin;

   return (
      <Button
         variant={isPending ? 'secondary' : 'outline'}
         disabled={isPending}
      >
         <Marker role="status">
            <MarkerIcon className={cn(isPending && spin && 'animate-spin')}>
               {icon}
            </MarkerIcon>
            <MarkerContent className={cn(isPending && 'shimmer')}>
               {label}
            </MarkerContent>
         </Marker>
      </Button>
   );
}
