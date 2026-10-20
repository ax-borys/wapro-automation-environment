'use client';
import { Checkbox } from '@/components/ui/checkbox';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
   BadgeReceiptNumber,
   OrderCard,
   OrderCardBody,
   OrderCardDeliveryCard,
   OrderCardFooter,
   OrderCardFooterActions,
   OrderCardHeader,
   OrderCardPackage,
   OrderCardRecipient,
   OrderCardTable,
   OrderCardTableBody,
   OrderCardTableFooter,
   OrderCardTableHeader,
   OrderCardTablePosition,
} from '@/components/ui/order-card';
import currency from 'currency.js';
import { Button } from '@/components/ui/button';
import {
   BusIcon,
   CashRegisterIcon,
   FloppyDiskIcon,
   InvoiceIcon,
   LinkIcon,
   PenIcon,
   ReceiptIcon,
   SealCheckIcon,
   SpinnerIcon,
   TruckIcon,
   WarningIcon,
   XIcon,
} from '@phosphor-icons/react';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import {
   useOrder,
   useOrdersStore,
   useFulfillOrders,
   type OrderModel,
   useChangeRequiredDocumentType,
} from '@/entities/order';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { EditOffer } from '../../edit-offer';
import { OfferModel, ProductModel, useOffersStore } from '@/entities/offer';
import { useGetAndStoreOffers } from '@/entities/offer/hooks/use-get-and-store-offers';
import Link from 'next/link';
import {
   EditDialog,
   EditDialogCancel,
   EditDialogContent,
   EditDialogDescription,
   EditDialogFooter,
   EditDialogHeader,
   EditDialogSave,
   EditDialogTrigger,
} from '@/components/ui/edit-dalog';
import { useCallback, useState } from 'react';
import { InvoiceNumberBadge } from '@/components/ui/badges';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from 'lucide-react';
import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
} from '@/components/ui/tooltip';
import { useReceipt } from '@/entities/receipt';

async function wait(delay = 3000) {
   return await new Promise((res, rej) => setTimeout(res, delay));
}

function Actions({ orderId }: { orderId: OrderModel['id'] }) {
   const { requiredDocumentType } = useOrdersStore((s) => s.orders[orderId]);
   const changeRequiredDocumentType = useChangeRequiredDocumentType(orderId);

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant={'ghost'}
               className="focus-visible:outline-none focus-visible:ring-0 border-0"
            >
               <EllipsisVerticalIcon />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent onChange={() => {}} className="min-w-40">
            <DropdownMenuGroup>
               <DropdownMenuLabel className="flex items-center gap-1">
                  Actions
               </DropdownMenuLabel>
               {requiredDocumentType === 'INVOICE' ? (
                  <DropdownMenuItem
                     onSelect={() => changeRequiredDocumentType('RECEIPT')}
                  >
                     <ReceiptIcon />
                     Require receipt
                  </DropdownMenuItem>
               ) : (
                  <DropdownMenuItem
                     onSelect={() => changeRequiredDocumentType('INVOICE')}
                  >
                     <InvoiceIcon />
                     Require invoice
                  </DropdownMenuItem>
               )}
            </DropdownMenuGroup>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}

export function Order({
   id,
   onChangeFiscalNumber,
}: {
   id: OrderModel['id'];
   onChangeFiscalNumber?: (value: number | null) => void;
}) {
   const { order, selectToggle, setInvoiceNumber } = useOrder(id);
   const { receipt, setFiscalNumber } = useReceipt(order.id);
   const { offers } = useOffersStore();

   const fulfillOrder = useFulfillOrders([order.id]);

   const [draftFiscalNumber, setDraftFiscalNumber] = useState<string>('');
   const [draftInvoiceNumber, setDraftInvoiceNumber] = useState<string>('');

   useGetAndStoreOffers();

   const { number, status, fiscalNumber } = receipt;

   const invoiceStatus = order.invoice.status;

   const fulfillOrdersHandler = async () => {
      // Guarantee that at least one field has value
      if (!order.invoice?.number && !receipt.fiscalNumber) {
         return;
      }

      await fulfillOrder();
   };

   const submitFiscalNumber = useCallback(() => {
      setFiscalNumber(Number(draftFiscalNumber));
      onChangeFiscalNumber?.(Number(draftFiscalNumber));

      setTimeout(() => setDraftFiscalNumber(''), 100);
   }, [draftFiscalNumber]);

   const submitInvoiceNumber = useCallback(() => {
      setInvoiceNumber(draftInvoiceNumber);
      setTimeout(() => setDraftInvoiceNumber(''), 100);
   }, [draftInvoiceNumber]);

   const copyToClipboard = (value: string) => {
      return navigator.clipboard.writeText(value);
   };

   const calculateTax = (offer: OfferModel): ProductModel['tax'] => {
      const items = offers[offer.id]?.items ?? offer.items;

      const itemsList = Object.values(items);

      if (itemsList.length) {
         return itemsList.reduce((a, b) => {
            if (a.tax !== b.tax) {
               // if taxes for one offer are different (several products have different tax rate)
               // return 0 to handle it manually
               a.tax = 0;
               return a;
            }

            return b;
         }).tax;
      } else {
         return 0;
      }
   };

   return (
      <OrderCard className="flex h-fit">
         <OrderCardHeader>
            <Checkbox
               className="cursor-pointer"
               checked={order.selected}
               onCheckedChange={() => selectToggle()}
            />
            <span className="font-medium underline">
               <Link
                  href={
                     'https://salescenter.allegro.com/orders?query=' +
                     order.externalId
                  }
                  target="_blank"
               >
                  Order #{order.externalId}
               </Link>
            </span>
            {order.requiredDocumentType === 'INVOICE' ? (
               <Badge>Invoice</Badge>
            ) : null}
            <div className="ml-auto flex gap-2 h-9">
               {receipt.number ? (
                  <Button
                     onClick={() => copyToClipboard(number as string)}
                     className="bg-transparent hover:bg-transparent cursor-pointer px-0"
                  >
                     <BadgeReceiptNumber value={number as string} />
                  </Button>
               ) : null}
               {fiscalNumber ? (
                  <BadgeFiskalNumber value={fiscalNumber} />
               ) : null}
               {order.invoice?.number ? (
                  <Button
                     onClick={() =>
                        order.invoice?.number &&
                        copyToClipboard(order.invoice?.number)
                     }
                     className="bg-transparent hover:bg-transparent cursor-pointer px-0"
                  >
                     <InvoiceNumberBadge value={order.invoice.number} />
                  </Button>
               ) : null}
               {order.paymentMethod === 'PREPAID' ? (
                  <BadgePaid />
               ) : (
                  <BadgePickup />
               )}
               <Actions orderId={order.id} />
            </div>
         </OrderCardHeader>
         <OrderCardBody>
            <OrderCardTable>
               <OrderCardTableHeader />
               <OrderCardTableBody>
                  {Object.values(order.positions).map((position, i) => {
                     const offer = offers[position.offerId] ?? position.offer;
                     const isOfferLinked = !!Object.values(offer.items).length;
                     const items = Object.values(offer.items);

                     return (
                        <OrderCardTablePosition
                           key={offer.externalId + i}
                           quantity={position.quantity}
                           tax={calculateTax(offer)}
                           net={
                              currency(position.price, {
                                 fromCents: true,
                              }).divide(1.23).value
                           }
                           gross={
                              currency(position.price, { fromCents: true })
                                 .value
                           }
                        >
                           <>
                              {isOfferLinked ? (
                                 <Tooltip>
                                    <TooltipContent>
                                       {items.map((itemc) => (
                                          <span
                                             key={itemc.id}
                                             className="flex items-center gap-2"
                                          >
                                             {itemc.name}
                                             <XIcon />
                                             {itemc.quantity}
                                          </span>
                                       ))}
                                    </TooltipContent>
                                    <TooltipTrigger className="flex items-center gap-2">
                                       <Link
                                          href={
                                             offer.src === 'allegro' &&
                                             offer.externalId !== 'delivery'
                                                ? `https://salescenter.allegro.com/my-assortment?limit=20&phrase=${offer.externalId}&sellingMode.format=BUY_NOW&context.marketplace=allegro-pl`
                                                : '#pending-orders'
                                          }
                                          target="_blank"
                                          className="flex items-center gap-2"
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
                                          <div className="overflow-auto border-primary border-b border-dashed">
                                             {offer.title}
                                          </div>
                                       </Link>
                                       <LinkIcon />
                                    </TooltipTrigger>
                                 </Tooltip>
                              ) : (
                                 <>
                                    <Link
                                       href={
                                          offer.src === 'allegro' &&
                                          offer.externalId !== 'delivery'
                                             ? `https://salescenter.allegro.com/my-assortment?limit=20&phrase=${offer.externalId}&sellingMode.format=BUY_NOW&context.marketplace=allegro-pl`
                                             : '#pending-orders'
                                       }
                                       className="flex items-center gap-2"
                                       target="_blank"
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
                                       <div className="overflow-auto">
                                          {offer.title}
                                       </div>
                                    </Link>
                                    <EditOffer
                                       trigger={
                                          <Button
                                             variant={'destructive'}
                                             className="cursor-pointer"
                                          >
                                             <WarningIcon className="w-fit" />
                                          </Button>
                                       }
                                       offer={offers[offer.id] ?? offer}
                                    />
                                 </>
                              )}
                           </>
                        </OrderCardTablePosition>
                     );
                  })}
               </OrderCardTableBody>
               <OrderCardTableFooter
                  totalNet={
                     currency(order.totalToPay, { fromCents: true }).divide(
                        1.23,
                     ).value
                  }
                  totalGross={
                     currency(order.totalToPay, { fromCents: true }).value
                  }
               />
            </OrderCardTable>
         </OrderCardBody>
         <OrderCardFooter>
            <OrderCardRecipient
               recipientFullName={
                  order.recipient.firstName && order.recipient.lastName
                     ? order.recipient.firstName +
                       ' ' +
                       order.recipient.lastName
                     : order.recipient.companyName + ''
               }
               orderProcessedAt={new Date(
                  order.preparedAt ?? Date.now(),
               ).toLocaleString()}
            />
            <div className="flex w-125 justify-between">
               <OrderCardDeliveryCard
                  className="w-75"
                  title={order.delivery.pointName || 'Delivery'}
                  address={order.delivery.address}
               />
               <OrderCardPackage numberOfPackages={order.packages} />
            </div>
            <OrderCardFooterActions>
               {order.requiredDocumentType === 'INVOICE' ? (
                  <>
                     {invoiceStatus !== 'RECORDED' ? (
                        <EditDialog
                           onSave={submitInvoiceNumber}
                           onCancel={() =>
                              setTimeout(() => setDraftInvoiceNumber(''), 100)
                           }
                        >
                           <EditDialogTrigger asChild>
                              <Button
                                 variant={
                                    order.invoice?.number
                                       ? 'outline'
                                       : 'default'
                                 }
                                 disabled={receipt.status !== 'RECORD'}
                              >
                                 <InvoiceIcon />
                              </Button>
                           </EditDialogTrigger>
                           <EditDialogContent>
                              <EditDialogHeader>
                                 <DialogTitle>Enter invoice number</DialogTitle>
                              </EditDialogHeader>
                              <EditDialogDescription>
                                 Make sure you are writing correct invoice
                                 number.
                              </EditDialogDescription>
                              <FieldGroup>
                                 <Field>
                                    <Label>Invoice number</Label>
                                    <Input
                                       autoFocus={true}
                                       value={draftInvoiceNumber}
                                       onChange={(e) => {
                                          setDraftInvoiceNumber(e.target.value);
                                       }}
                                    />
                                 </Field>
                              </FieldGroup>
                              <EditDialogFooter className="-m-6 p-6 py-4 mt-0 bg-sidebar rounded-b-xl border-t border-border">
                                 <EditDialogCancel />
                                 <EditDialogSave />
                              </EditDialogFooter>
                           </EditDialogContent>
                        </EditDialog>
                     ) : null}
                     {invoiceStatus === 'RECORD' ? (
                        <Button
                           variant={
                              order.invoice?.number ? 'default' : 'outline'
                           }
                           onClick={fulfillOrdersHandler}
                           disabled={!order.invoice?.number}
                        >
                           <InvoiceIcon />
                           {order.invoice?.number
                              ? 'Approve invoice'
                              : 'Invoice required'}
                        </Button>
                     ) : invoiceStatus === 'RECORDING' ? (
                        <Button variant={'secondary'} disabled>
                           <Marker role="status">
                              <MarkerIcon className="animate-spin">
                                 <SpinnerIcon />
                              </MarkerIcon>
                              <MarkerContent className="shimmer">
                                 Approving
                              </MarkerContent>
                           </Marker>
                        </Button>
                     ) : (
                        <Button variant={'outline'}>
                           <Marker role="status">
                              <MarkerIcon>
                                 <SealCheckIcon />
                              </MarkerIcon>
                              <MarkerContent>Approved</MarkerContent>
                           </Marker>
                        </Button>
                     )}
                  </>
               ) : (
                  <>
                     <EditDialog
                        onSave={submitFiscalNumber}
                        onCancel={() =>
                           setTimeout(() => setDraftFiscalNumber(''), 100)
                        }
                     >
                        <EditDialogTrigger asChild>
                           <Button
                              variant={'outline'}
                              disabled={receipt.status !== 'RECORD'}
                           >
                              <CashRegisterIcon />
                           </Button>
                        </EditDialogTrigger>
                        <EditDialogContent>
                           <EditDialogHeader>
                              <DialogTitle>
                                 Enter receipt's fiscal number
                              </DialogTitle>
                           </EditDialogHeader>
                           <EditDialogDescription>
                              Make sure you are writing correct fiscal number.
                           </EditDialogDescription>
                           <FieldGroup>
                              <Field>
                                 <Label>Fiscal number</Label>
                                 <Input
                                    autoFocus={true}
                                    value={draftFiscalNumber}
                                    onChange={(e) => {
                                       if (
                                          Number.isInteger(
                                             Number(e.target.value),
                                          )
                                       ) {
                                          setDraftFiscalNumber(e.target.value);
                                       }
                                    }}
                                 />
                              </Field>
                           </FieldGroup>
                           <EditDialogFooter className="-m-6 p-6 py-4 mt-0 bg-sidebar rounded-b-xl border-t border-border">
                              <EditDialogCancel />
                              <EditDialogSave />
                           </EditDialogFooter>
                        </EditDialogContent>
                     </EditDialog>
                     {status === 'RECORD' ? (
                        <Button
                           onClick={fulfillOrdersHandler}
                           disabled={fiscalNumber ? false : true}
                        >
                           <ReceiptIcon />
                           Record a receipt
                        </Button>
                     ) : status === 'RECORDING' ? (
                        <Button variant={'secondary'} disabled>
                           <Marker role="status">
                              <MarkerIcon className="animate-spin">
                                 <SpinnerIcon />
                              </MarkerIcon>
                              <MarkerContent className="shimmer">
                                 Recording
                              </MarkerContent>
                           </Marker>
                        </Button>
                     ) : (
                        <Button variant={'outline'}>
                           <Marker role="status">
                              <MarkerIcon>
                                 <FloppyDiskIcon />
                              </MarkerIcon>
                              <MarkerContent>Recorded</MarkerContent>
                           </Marker>
                        </Button>
                     )}
                  </>
               )}
            </OrderCardFooterActions>
         </OrderCardFooter>
      </OrderCard>
   );
}
