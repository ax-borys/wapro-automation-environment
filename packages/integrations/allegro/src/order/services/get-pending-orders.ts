import { obtainAuthTokens } from '../../auth';
import { store } from '../../store/store';
import { wait } from '../../utils/wait';
import { fetchInvoices } from '../api/fetch-invoices';
import { fetchOrders } from '../api/fetch-orders';
import { RawOrder } from '../types';
import { mapOrder, Order } from '../mappers/map-order';
import { assertStore } from '../../assertions';
import { getOffersById } from '../../offer';

export async function getPendingOrders(): Promise<Order[]> {
   assertStore(store);

   const { userAgent } = store.getState();
   const { accessToken } = await obtainAuthTokens();

   const result = await fetchOrders(accessToken, userAgent);
   const rawOrders = result.checkoutForms;

   const filteredOrders: RawOrder[] = [];

   for (const order of rawOrders) {
      const result = await fetchInvoices(accessToken, order.id);
      await wait(10);
      if (result.hasExternalInvoices) continue;
      filteredOrders.push(order);
   }

   const involvedOffers = await getOffersById([
      ...new Set(
         filteredOrders.flatMap((rawOrder) =>
            rawOrder.lineItems.map((i) => i.offer.id),
         ),
      ),
   ]);

   const orders = filteredOrders.map((i) => mapOrder(i, involvedOffers));

   return orders;
}
