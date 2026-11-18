'use client';
import {
   OrderCard,
   OrderCardBody,
   OrderCardDeliveryCard,
   OrderCardFooter,
   OrderCardTable,
   OrderCardTableBody,
   OrderCardTableFooter,
   OrderCardTableHeader,
   OrderCardTablePosition,
} from '@/components/ui/order-card';
import currency from 'currency.js';
import { Button } from '@/components/ui/button';
import { WarningIcon } from '@phosphor-icons/react';
import { useOrder, type OrderModel } from '@/entities/order';
import { useOffersStore } from '@/entities/offer';
import { EditOffer } from '@/components/features/edit-offer';

export function Order({ id }: { id: OrderModel['id'] }) {
   const { order } = useOrder(id);

   const { offers } = useOffersStore();

   return (
      <OrderCard className="flex h-fit">
         <OrderCardBody>
            <OrderCardTable>
               <OrderCardTableHeader />
               <OrderCardTableBody>
                  {order.positions.map((position, i) => {
                     ``;
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
