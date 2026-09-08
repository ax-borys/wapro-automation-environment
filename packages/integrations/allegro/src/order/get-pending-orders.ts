import { obtainAuthTokens } from '../auth';
import { store } from '../store/store';
import { wait } from '../utils/wait';
import { fetchInvoices } from './fetch-invoices';
import { fetchOrders } from './fetch-orders';
import { RawOrder } from './types';
import * as v from 'valibot';
import currency from 'currency.js';
import { originalImgSrcTos128b } from '../utils/originalImgSrcTos128b';
import { NotNull, or } from 'drizzle-orm';
import { mapOrder, Order } from './map-order';

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
