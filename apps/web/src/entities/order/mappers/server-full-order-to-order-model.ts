import { normilizeItems } from '@/entities/offer';
import { normilizePositions } from '../orders.store';
import {
   InvoiceModel,
   OrderModel,
   ReceiptModel,
   ServerFullOrder,
} from '../types';

export function serverFullOrderToOrderModel(
   order: ServerFullOrder,
   state?: {
      isSelected?: boolean;
      invoice?: {
         isRecording?: boolean;
         draft?: { number: InvoiceModel['draft']['number'] };
      };
      receipt?: {
         isRecording?: boolean;
         draft?: { fiscalNumber: ReceiptModel['draft']['fiscalNumber'] };
      };
   },
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
         isRecording:
            state?.invoice?.isRecording !== undefined
               ? state.invoice.isRecording
               : false,
         draft: {
            number:
               state?.invoice?.draft?.number !== undefined
                  ? state.invoice.draft.number
                  : null,
         },
      },
      receipt: {
         original: order.receipt
            ? { ...order.receipt, createdAt: new Date(order.receipt.createdAt) }
            : null,
         isRecording:
            state?.receipt?.isRecording !== undefined
               ? state.receipt.isRecording
               : false,
         draft: {
            fiscalNumber:
               state?.receipt?.draft?.fiscalNumber !== undefined
                  ? state.receipt.draft.fiscalNumber
                  : null,
         },
      },
      isSelected: state?.isSelected !== undefined ? state.isSelected : false,
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
