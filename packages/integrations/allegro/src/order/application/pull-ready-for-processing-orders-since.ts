import { obtainAuthTokens } from '../../auth';
import { SyncCursor } from '../../core';
import { getOffersById } from '../../offer';
import { store } from '../../store/store';
import { fetchOrders } from '../api';
import { mapOrder, type Order } from '../mappers/map-order';

type PullOrdersResult = { orders: Order[]; cursor: SyncCursor };

export async function pullReadyForProcessingOrdersSince(
   cursor: SyncCursor,
): Promise<PullOrdersResult> {
   const { userAgent } = store.getState();
   const { accessToken } = await obtainAuthTokens();

   const { checkoutForms: rawOrders } = await fetchOrders(
      { accessToken, userAgent },
      {
         sort: 'updatedAt',
         status: 'READY_FOR_PROCESSING',
         updatedAtGte: cursor.lastSyncUpdatedAt,
         pageSize: 100,
      },
   );

   // handle possibility that order might be cancelled manually
   const filteredRawOrders = rawOrders.filter(
      (rawOrder) => rawOrder.fulfillment.status !== 'CANCELLED',
   );

   const involvedOffers = await getOffersById([
      ...new Set(
         filteredRawOrders.flatMap((rawOrder) =>
            rawOrder.lineItems.map((i) => i.offer.id),
         ),
      ),
   ]);

   const orders = filteredRawOrders
      .map((i) => mapOrder(i, involvedOffers))
      .filter(
         (order): order is typeof order & { status: 'READY_FOR_PROCESSING' } =>
            order.status === 'READY_FOR_PROCESSING',
      );

   const lastRawOrder = filteredRawOrders.at(-1);

   const newCursor: SyncCursor = lastRawOrder
      ? {
           lastSyncUpdatedAt: new Date(lastRawOrder.updatedAt),
        }
      : { ...cursor };

   return {
      orders,
      cursor: newCursor,
   };
}
