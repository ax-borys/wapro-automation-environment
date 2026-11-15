import { obtainAuthTokens } from '../../auth';
import { SyncCursor } from '../../core';
import { getOffersById } from '../../offer';
import { store } from '../../store/store';
import { fetchOrders } from '../api';
import { mapOrder, type Order } from '../mappers/map-order';

type PullOrdersResult = { orders: Order[]; cursor: SyncCursor };

export async function pullProcessingOrdersSince(
   cursor: SyncCursor,
): Promise<PullOrdersResult> {
   const { userAgent } = store.getState();
   const { accessToken } = await obtainAuthTokens();

   const { checkoutForms: rawOrders } = await fetchOrders(
      { accessToken, userAgent },
      {
         sort: 'updatedAt',
         status: 'READY_FOR_PROCESSING',
         fulfillmentStatus: 'SENT',
         updatedAtGte: cursor.lastSyncUpdatedAt,
         pageSize: 100,
      },
   );

   const involvedOffers = await getOffersById([
      ...new Set(
         rawOrders.flatMap((rawOrder) =>
            rawOrder.lineItems.map((i) => i.offer.id),
         ),
      ),
   ]);

   const orders = rawOrders.map((i) => mapOrder(i, involvedOffers));

   const lastRawOrder = rawOrders.at(-1);

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
