import {
   offerInputSchema,
   orderInputSchema,
   productInputSchema,
   receiptPositionInputSchema,
   customerSchema,
   orderSchema,
   positionSchema,
   offerSchema,
} from '@wae/types';
import { obtainAuthTokens } from '../auth';
import { store } from '../store/store';
import { wait } from '../utils/wait';
import { fetchInvoices } from './fetch-invoices';
import { fetchOrders } from './fetch-orders';
import { RawOrder } from './types';
import * as v from 'valibot';
import { addressSchema, customerInputSchema } from '@wae/types';
import currency from 'currency.js';
import { originalImgSrcTos128b } from '../utils/originalImgSrcTos128b';

export const orderValidationSchema = v.object({
   ...v.omit(orderSchema, ['id', 'customerId', 'clientTag']).entries,
   address: v.omit(addressSchema, ['customerId', 'orderId', 'clientTag']),
   customer: v.omit(customerSchema, ['id', 'clientTag']),
   positions: v.array(
      v.object({
         ...v.omit(positionSchema, [
            'clientTag',
            'receiptId',
            'offerId',
            'orderId',
         ]).entries,
         offer: v.pick(offerSchema, ['externalId', 'src']),
      }),
   ),
});

type Order = v.InferOutput<typeof orderValidationSchema>;

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

   const orders: Order[] = filteredOrders.map((order) => ({
      externalId: order.id,
      status: 'READY_FOR_PROCESSING' as const,
      totalPaid: currency(order.payment.paidAmount?.amount || 0).intValue,
      totalToPay: currency(order.summary.totalToPay.amount).intValue,
      address: {
         city: order.delivery.address.city,
         street: order.delivery.address.street,
         postalCode: order.delivery.address.zipCode,
         countryCode: order.delivery.address.countryCode,
      },
      customer: {
         phoneNumber: order.delivery.address.phoneNumber,
         companyName: order.delivery.address.companyName,
         email: order.buyer.email,
         externalId: order.buyer.id,
         firstName: order.delivery.address.firstName,
         lastName: order.delivery.address.lastName,
      },
      packages: order.delivery.calculatedNumberOfPackages || 1,
      positions: order.lineItems.map((i) => ({
         quantity: i.quantity,
         price: currency(i.price.amount).intValue,
         offer: {
            src: 'allegro',
            externalId: i.offer.id,
         },
      })),
      src: 'allegro',
      paymentMethod: order.payment.type === 'ONLINE' ? 'PREPAID' : 'POSTPAID',
      fulfilledAt: null,
      preparedAt: new Date(order.updatedAt),
      createdAt: new Date(),
   }));

   const validatedOrders = v.parse(v.array(orderValidationSchema), orders);

   return validatedOrders;
}
