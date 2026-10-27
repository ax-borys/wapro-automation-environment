import { normilizeItems } from '@/entities/offer';
import { fetchPendingOrders } from '../api/fetch-pending-orders';
import { normilizePositions } from '../orders.store';
import { OrderModel } from '../types';

type FetchedPendingOrder = Awaited<
   ReturnType<typeof fetchPendingOrders>
>[number];

export function fetchedPendingOrderToOrderModel(
   order: FetchedPendingOrder,
): OrderModel {
   return {
      ...order,
      original: {
         ...order,
         createdAt: new Date(order.createdAt),
         preparedAt: new Date(order.preparedAt),
         fulfilledAt: order.fulfilledAt ? new Date(order.fulfilledAt) : null,
      },

      receipt: order.receipt
         ? {
              original: {
                 ...order.receipt,
                 createdAt: new Date(order.receipt.createdAt),
              },
              isRecording: false,
              draft: { fiscalNumber: null },
           }
         : {
              original: null,
              isRecording: false,
              draft: { fiscalNumber: null },
           },

      invoice: order.invoice
         ? {
              original: {
                 ...order.invoice,
                 createdAt: new Date(order.invoice.createdAt),
              },
              draft: { number: null },
              isRecording: false,
           }
         : {
              original: null,
              draft: { number: null },
              isRecording: false,
           },
      isSelected: false,
      positions: normilizePositions(
         order.positions.map((position) => ({
            ...position,
            offer: {
               ...position.offer,
               items: normilizeItems(
                  position.offer.items.flatMap((item) => ({
                     ...item.product,
                     quantity: item.quantity,
                  })),
               ),
            },
         })),
      ),
   };
}
