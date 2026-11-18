import { obtainAuthTokens } from '../../auth';
import { SyncCursor } from '../../core';
import { errorOccured } from '../../error';
import { getOffersById } from '../../offer';
import { store } from '../../store/store';
import { fetchOrders } from '../api';
import { mapOrder, type Order } from '../mappers/map-order';

type PullOrdersResult = { orders: Order[]; cursor: SyncCursor };

function pickLowestDate(dates: Date[]): Date {
   if (!dates.length) {
      throw errorOccured(
         'UNPROCESSABLE',
         'pickLowestDate argument must be not empty array.',
      );
   }

   const lowestTimestamp = Math.min(...dates.map((date) => date.getTime()));

   const lowestDate = new Date(lowestTimestamp);

   return lowestDate;
}

function pickHighestDate(dates: Date[]): Date {
   if (!dates.length) {
      throw errorOccured(
         'UNPROCESSABLE',
         'pickHighestDate argument must be not empty array.',
      );
   }

   const highestTimestamp = Math.max(...dates.map((date) => date.getTime()));

   const highestDate = new Date(highestTimestamp);

   return highestDate;
}

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

   const orders = filteredRawOrders.map((i) => mapOrder(i, involvedOffers));
   const processingOrders = orders.filter(
      (order): order is typeof order & { status: 'PROCESSING' } =>
         order.status === 'PROCESSING',
   );

   const notProcessingOrders = orders.filter(
      (
         order,
      ): order is typeof order & {
         status: Exclude<(typeof order)['status'], 'PROCESSING'>;
      } => order.status !== 'PROCESSING',
   );

   const newCursor: SyncCursor = notProcessingOrders.length
      ? {
           lastSyncUpdatedAt: pickLowestDate(
              notProcessingOrders.map((order) => order.preparedAt),
           ),
        }
      : processingOrders.length
        ? {
             lastSyncUpdatedAt: pickHighestDate(
                processingOrders.map((order) => order.preparedAt),
             ),
          }
        : { ...cursor };

   return {
      orders: processingOrders,
      cursor: newCursor,
   };
}
