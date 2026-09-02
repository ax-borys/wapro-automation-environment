import {
   offerInputSchema,
   orderInputSchema,
   productInputSchema,
   receiptPositionInputSchema,
   customerSchema,
} from '@wae/types';
import { obtainAuthTokens } from '../auth';
import { store } from '../store/store';
import { wait } from '../utils/wait';
import { fetchInvoices } from './fetch-invoices';
import { fetchOrders } from './fetch-orders';
import { RawOrder } from './types';
import * as v from 'valibot';
import { addressInputSchema, customerInputSchema } from '@wae/types';
import currency from 'currency.js';

const orderValidationSchema = v.object({
   ...v.omit(orderInputSchema, ['id', 'customerId']).entries,
   deliveryAddress: v.omit(addressInputSchema, ['customerId', 'orderId']),
   customer: v.omit(customerSchema, ['id']),
   packages: v.pipe(v.number(), v.minValue(1)),
   positions: v.array(
      v.object({
         ...v.omit(receiptPositionInputSchema, [
            'clientTag',
            'receiptId',
            'offerId',
            'orderId',
         ]).entries,
         externalOfferId: v.pick(offerInputSchema, ['externalId']).entries
            .externalId,
      }),
   ),
   preparedAt: v.date(),
   createdAt: v.date(),
});

type Order = v.InferInput<typeof orderValidationSchema>;

export async function getPendingOrders(): Promise<Order[]> {
   const { userAgent } = store.getState();
   const { accessToken } = await obtainAuthTokens();

   const result = await fetchOrders(accessToken, userAgent);
   const rawOrders = result.checkoutForms;

   const filteredOrders: RawOrder[] = [];

   for (const order of rawOrders) {
      const result = await fetchInvoices(accessToken, order.id);
      await wait(500);
      if (result.hasExternalInvoices) continue;
      filteredOrders.push(order);
   }

   const orders: Order[] = filteredOrders.map((order) => ({
      externalId: order.id,
      status: order.status,
      totalPaid: currency(order.payment.paidAmount?.amount || 0).intValue,
      totalToPay: currency(order.summary.totalToPay.amount).intValue,
      deliveryAddress: {
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
         externalOfferId: i.offer.id,
         quantity: i.quantity,
         price: currency(i.price.amount).intValue,
      })),
      src: 'allegro',
      paymentMethod: order.payment.type === 'ONLINE' ? 'PREPAID' : 'POSTPAID',
      preparedAt: new Date(order.updatedAt),
      createdAt: new Date(),
   }));

   const validatedOrders = v.parse(v.array(orderValidationSchema), orders);

   return validatedOrders;
}
