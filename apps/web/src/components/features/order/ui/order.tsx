'use client';
import { Checkbox } from '@/components/ui/checkbox';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
   BadgeReceiptNumber,
   OrderCard,
   OrderCardActionButton,
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
   useInvoice,
   useReceipt,
   useFiscalNumber,
   useInvoiceNumber,
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
import { InvoiceNumberBadge, ReceiptNumberBadge } from '@/components/ui/badges';
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
   const {
      order,
      selectToggle,
      setDraftInvoiceNumber,
      setDraftFiscalNumber,
      status,
   } = useOrder(id);

   const receipt = useReceipt(order.id);
   const invoice = useInvoice(order.id);

   const fiscalNumber = useFiscalNumber(order.id);
   const invoiceNumber = useInvoiceNumber(order.id);

   const { offers } = useOffersStore();

   const fulfillOrder = useFulfillOrders([order.id]);

   const [fiscalNumberInput, setFiscalNumberInput] = useState<string>('');
   const [invoiceNumberInput, setInvoiceNumberInput] = useState<string>('');

   useGetAndStoreOffers();

   const fulfillOrdersHandler = async () => {
      await fulfillOrder();
   };

   const submitFiscalNumber = useCallback(() => {
      setDraftFiscalNumber(fiscalNumberInput);
      onChangeFiscalNumber?.(Number(fiscalNumber));

      setTimeout(() => setDraftFiscalNumber(''), 100);
   }, [fiscalNumberInput]);

   const submitInvoiceNumber = useCallback(() => {
      setDraftInvoiceNumber(invoiceNumberInput);
      setTimeout(() => setDraftInvoiceNumber(''), 100);
   }, [invoiceNumberInput]);

   return (
      <OrderCard className="flex h-fit">
         <OrderCardHeader>
            <Checkbox
               className="cursor-pointer"
               checked={order.isSelected}
               onCheckedChange={() => selectToggle()}
            />
            <span className="font-medium underline">
               <Link
                  href={
                     'https://salescenter.allegro.com/orders?query=' +
                     order.original.externalId
                  }
                  target="_blank"
               >
                  Order #{order.original.externalId}
               </Link>
            </span>
            {order.requiredDocumentType === 'INVOICE' ? (
               <Badge>Invoice</Badge>
            ) : null}
            <div className="ml-auto flex gap-2 h-9">
               {receipt.original?.number ? (
                  <ReceiptNumberBadge value={receipt.original?.number} />
               ) : null}
               {fiscalNumber ? (
                  <BadgeFiskalNumber value={fiscalNumber} />
               ) : null}
               {invoiceNumber ? (
                  <InvoiceNumberBadge value={invoiceNumber} />
               ) : null}
               {order.original.paymentMethod === 'PREPAID' ? (
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

                     return (
                        <OrderCardTablePosition
                           key={offer.externalId + i}
                           position={position}
                           offer={offer}
                           editOfferComp={
                              <EditOffer
                                 trigger={
                                    <Button
                                       variant={'destructive'}
                                       className="cursor-pointer"
                                    >
                                       <WarningIcon className="w-fit" />
                                    </Button>
                                 }
                                 offer={offer}
                              />
                           }
                        />
                     );
                  })}
               </OrderCardTableBody>
               <OrderCardTableFooter
                  totalNet={
                     currency(order.original.totalToPay, {
                        fromCents: true,
                     }).divide(1.23).value
                  }
                  totalGross={
                     currency(order.original.totalToPay, { fromCents: true })
                        .value
                  }
               />
            </OrderCardTable>
         </OrderCardBody>
         <OrderCardFooter>
            <OrderCardRecipient
               recipientFullName={
                  order.original.recipient.firstName &&
                  order.original.recipient.lastName
                     ? order.original.recipient.firstName +
                       ' ' +
                       order.original.recipient.lastName
                     : order.original.recipient.companyName + ''
               }
               orderProcessedAt={new Date(
                  order.original.preparedAt ?? Date.now(),
               ).toLocaleString()}
            />
            <div className="flex w-125 justify-between">
               <OrderCardDeliveryCard
                  className="w-75"
                  title={order.original.delivery.pointName || 'Delivery'}
                  address={order.original.delivery.address}
               />
               <OrderCardPackage numberOfPackages={order.original.packages} />
            </div>
            <OrderCardFooterActions>
               {order.requiredDocumentType === 'INVOICE' ? (
                  <>
                     {status !== 'RECORDED' ? (
                        <EditDialog
                           onSave={submitInvoiceNumber}
                           onCancel={() =>
                              setTimeout(() => setDraftInvoiceNumber(''), 100)
                           }
                        >
                           <EditDialogTrigger asChild>
                              <Button
                                 variant={
                                    order.invoice.draft.number
                                       ? 'outline'
                                       : 'default'
                                 }
                                 disabled={status !== 'RECORD'}
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
                                       value={invoiceNumberInput}
                                       onChange={(e) => {
                                          setInvoiceNumberInput(e.target.value);
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
                     <OrderCardActionButton
                        status={status}
                        variant={invoiceNumber ? 'default' : 'outline'}
                        disabled={!invoiceNumber}
                        idle={{
                           icon: <InvoiceIcon />,
                           label: 'Approve invoice',
                        }}
                        pending={{
                           icon: <SpinnerIcon />,
                           label: 'Recording',
                        }}
                        done={{ icon: <SealCheckIcon />, label: 'Recorded' }}
                        onClick={fulfillOrdersHandler}
                     />
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
                              variant={fiscalNumber ? 'outline' : 'default'}
                              disabled={status !== 'RECORD'}
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
                                    value={fiscalNumberInput}
                                    onChange={(e) => {
                                       if (
                                          Number.isInteger(
                                             Number(e.target.value),
                                          )
                                       ) {
                                          setFiscalNumberInput(e.target.value);
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
                     <OrderCardActionButton
                        status={status}
                        variant={fiscalNumber ? 'default' : 'outline'}
                        disabled={!fiscalNumber}
                        idle={{
                           icon: <ReceiptIcon />,
                           label: 'Record receipt',
                        }}
                        pending={{
                           icon: <SpinnerIcon />,
                           label: 'Recording',
                        }}
                        done={{ icon: <FloppyDiskIcon />, label: 'Recorded' }}
                        onClick={fulfillOrdersHandler}
                     />
                  </>
               )}
            </OrderCardFooterActions>
         </OrderCardFooter>
      </OrderCard>
   );
}
