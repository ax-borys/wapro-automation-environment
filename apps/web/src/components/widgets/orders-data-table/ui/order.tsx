'use client';
import { Checkbox } from '@/components/ui/checkbox';
import {
   BadgeFiskalNumber,
   BadgePaid,
   BadgePickup,
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
   FloppyDiskIcon,
   InvoiceIcon,
   ReceiptIcon,
   SealCheckIcon,
   SpinnerIcon,
   WarningIcon,
} from '@phosphor-icons/react';
import {
   useOrder,
   useFulfillOrders,
   type OrderModel,
   useFiscalNumber,
   useInvoiceNumber,
   useReceiptNumber,
} from '@/entities/order';
import { Badge } from '@/components/ui/badge';
import { useOffersStore } from '@/entities/offer';
import Link from 'next/link';
import { InvoiceNumberBadge, ReceiptNumberBadge } from '@/components/ui/badges';
import { OrderActions } from '@/components/features/order-actions';
import { EditOffer } from '@/components/features/edit-offer';
import { SetInvoiceNumber } from '@/components/features/set-invoice-number';
import { SetFiscalNumber } from '@/components/features/set-fiscal-number';

export function Order({ id }: { id: OrderModel['id'] }) {
   const { order, status } = useOrder(id);

   const receiptNumber = useReceiptNumber(order.id);
   const fiscalNumber = useFiscalNumber(order.id);
   const invoiceNumber = useInvoiceNumber(order.id);

   const { offers } = useOffersStore();

   return (
      <OrderCard className="flex h-fit">
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
            <OrderCardDeliveryCard
               title={order.original.delivery.pointName || 'Delivery'}
               address={order.original.delivery.address}
            />
         </OrderCardFooter>
      </OrderCard>
   );
}
