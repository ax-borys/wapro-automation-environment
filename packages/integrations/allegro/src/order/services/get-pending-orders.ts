import { obtainAuthTokens } from '../../auth';
import { store } from '../../store/store';
import { wait } from '../../utils/wait';
import { fetchInvoices } from '../api/fetch-invoices';
import { fetchOrders } from '../api/fetch-orders';
import { RawOrder } from '../types';
import { mapOrder, Order } from '../mappers/map-order';

export async function getPendingOrders(): Promise<Order[]> {
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

   const orders = filteredOrders.map(mapOrder);

   return orders;
}
