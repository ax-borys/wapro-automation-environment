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

   // only processing orders
   const orders = filteredRawOrders
      .map((i) => mapOrder(i, involvedOffers))
      .filter((order) => order.status === 'PROCESSING');

   const lastRawOrder = filteredRawOrders.at(-1);

   // create new cursor with new date only if there're no left not processing orders and minimum one order was returned
   const newCursor: SyncCursor =
      lastRawOrder && filteredRawOrders.length === orders.length
         ? {
              lastSyncUpdatedAt: new Date(lastRawOrder.updatedAt),
           }
         : { ...cursor };

   return {
      orders,
      cursor: newCursor,
   };
}
