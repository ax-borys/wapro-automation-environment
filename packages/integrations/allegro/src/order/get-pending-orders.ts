import { obtainAuthTokens } from '../auth';
import { store } from '../store/store';
import { wait } from '../utils/wait';
import { fetchInvoices } from './fetch-invoices';
import { fetchOrders } from './fetch-orders';
import { RawOrder } from './types';

export async function getPendingOrders(): Promise<RawOrder[]> {
   const { userAgent } = store.getState();
   const { accessToken } = await obtainAuthTokens();

   const result = await fetchOrders(accessToken, userAgent);
   const orders = result.checkoutForms;

   const filteredOrders: RawOrder[] = [];
   for (const order of orders) {
      const result = await fetchInvoices(accessToken, order.id);
      await wait(500);
      if (result.hasExternalInvoices) continue;
      filteredOrders.push(order);
   }

   return filteredOrders;
}
