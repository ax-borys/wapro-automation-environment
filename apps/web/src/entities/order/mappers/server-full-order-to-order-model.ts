import { normilizeItems } from '@/entities/offer';
import { normilizePositions } from '../orders.store';
import { OrderModel, ServerFullOrder } from '../types';

export function serverFullOrderToOrderModel(
   order: ServerFullOrder,
): OrderModel {
   return {
      id: order.id,
      original: {
         ...order,
         createdAt: new Date(order.createdAt),
         preparedAt: new Date(order.preparedAt),
         fulfilledAt: order.fulfilledAt ? new Date(order.fulfilledAt) : null,
      },
      invoice: {
         original: order.invoice
            ? { ...order.invoice, createdAt: new Date(order.invoice.createdAt) }
            : null,
         isRecording: false,
         draft: { number: null },
      },
      receipt: {
         original: order.receipt
            ? { ...order.receipt, createdAt: new Date(order.receipt.createdAt) }
            : null,
         isRecording: false,
         draft: { fiscalNumber: null },
      },
      isSelected: false,
      requiredDocumentType: order.requiredDocumentType,
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
