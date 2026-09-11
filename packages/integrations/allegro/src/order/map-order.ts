import {
   addressSchema,
   customerFullSchema,
   customerWithCompanyNameSchema,
   customerWithFullNameSchema,
   deliverySchema,
   offerSchema,
   orderSchema,
   positionSchema,
   recipientFullSchema,
   recipientWithCompanyNameSchema,
   recipientWithFullNameSchema,
} from '@wae/types';
import { RawOrder } from './types';
import * as v from 'valibot';
import currency from 'currency.js';

const customerSchema = v.union([
   v.object({
      ...v.omit(customerWithCompanyNameSchema, ['id', 'addressId']).entries,
      address: v.nullable(v.omit(addressSchema, ['id'])),
   }),
   v.object({
      ...v.omit(customerFullSchema, ['id', 'addressId']).entries,
      address: v.nullable(v.omit(addressSchema, ['id'])),
   }),
   v.object({
      ...v.omit(customerWithFullNameSchema, ['id', 'addressId']).entries,
      address: v.nullable(v.omit(addressSchema, ['id'])),
   }),
]);

const recipientSchema = v.union([
   v.object({
      ...v.omit(recipientFullSchema, ['id', 'addressId']).entries,
      address: v.omit(addressSchema, ['id']),
   }),
   v.object({
      ...v.omit(recipientWithFullNameSchema, ['id', 'addressId']).entries,
      address: v.omit(addressSchema, ['id']),
   }),
   v.object({
      ...v.omit(recipientWithCompanyNameSchema, ['id', 'addressId']).entries,
      address: v.omit(addressSchema, ['id']),
   }),
]);

export const deliveryWithAddressSchema = v.object({
   ...v.omit(deliverySchema, ['id', 'addressId']).entries,
   address: v.omit(addressSchema, ['id']),
});

export const orderValidationSchema = v.object({
   ...v.omit(orderSchema, ['id', 'customerId', 'recepientId', 'deliveryId'])
      .entries,
   customer: customerSchema,
   recipient: recipientSchema,
   delivery: deliveryWithAddressSchema,
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

type Address = v.InferInput<typeof addressSchema>;
export type Order = v.InferOutput<typeof orderValidationSchema>;

export function mapOrder(order: RawOrder): Order {
   const customerAddress = {
      city: order.buyer.address?.city || null,
      street: order.buyer.address?.street || null,
      postalCode: order.buyer.address?.postCode || null,
      countryCode: order.buyer.address?.countryCode || null,
      clientTag: order.id,
   };

   const validatedCustomerAddress = v.safeParse(
      v.omit(addressSchema, ['id']),
      customerAddress,
   );

   if (
      !order.buyer.companyName &&
      !order.buyer.firstName &&
      !order.buyer.lastName
   ) {
      throw new Error("CompanyName and Customer's names cannot be null");
   }

   const customer: Order['customer'] = {
      firstName: order.buyer.firstName,
      lastName: order.buyer.lastName,
      companyName: order.buyer.companyName,
      email: order.buyer.email,
      phoneNumber: order.buyer.phoneNumber,
      externalId: order.buyer.id,
      address: validatedCustomerAddress.success
         ? validatedCustomerAddress.output
         : null,
      clientTag: order.id,
   } as Order['customer'];

   const validatedCustomer = v.parse(customerSchema, customer);

   if (!order.delivery) {
      throw new Error('Delivery field cannot be empty.');
   }

   if (!order.delivery.address) {
      throw new Error('Delivery address cannot be empty. Allegro is kidding.');
   }

   const recipientAddress: Order['recipient']['address'] = {
      city: order.delivery.address.city,
      countryCode: order.delivery.address.countryCode,
      postalCode: order.delivery.address.zipCode,
      street: order.delivery.address.street,
      clientTag: order.id,
   };

   const validatedRecipientAddress = v.parse(
      v.omit(addressSchema, ['id']),
      recipientAddress,
   );

   const recipient: Order['recipient'] = {
      address: validatedRecipientAddress,
      companyName: order.delivery.address.companyName,
      firstName: order.delivery.address.firstName,
      lastName: order.delivery.address.lastName,
      email: null,
      phoneNumber: order.delivery.address.phoneNumber,
      clientTag: order.id,
   };

   const validatedRecipient = v.parse(recipientSchema, recipient);

   const pickupPointAddress = {
      city: order.delivery.pickupPoint?.address?.city,
      street: order.delivery.pickupPoint?.address?.street,
      countryCode: order.delivery.pickupPoint?.address?.countryCode,
      postalCode: order.delivery.pickupPoint?.address?.zipCode,
      clientTag: order.id,
   };

   const validatedPickupPointAddress = v.safeParse(
      v.omit(addressSchema, ['id']),
      pickupPointAddress,
   );

   const createPointName = (
      pointId?: string | null,
      pointName?: string | null,
      deliveryMethod?: string | null,
   ) => {
      return `${deliveryMethod ?? 'Delivery'} ${pointId ? '- ' + pointId : ''}`;
   };

   const delivery: Order['delivery'] = validatedPickupPointAddress.success
      ? {
           pointId: order.delivery.pickupPoint?.id || null,
           pointName: createPointName(
              order.delivery.pickupPoint?.id,
              order.delivery.pickupPoint?.name,
              order.delivery.method?.name,
           ),
           pointDescription: order.delivery.pickupPoint?.description || null,
           address: validatedPickupPointAddress.output,
           clientTag: order.id,
        }
      : {
           pointId: null,
           pointName: order.delivery?.method?.name || null,
           pointDescription: null,
           address: validatedRecipientAddress,
           clientTag: order.id,
        };

   const validatedDelivery = v.parse(deliveryWithAddressSchema, delivery);

   const mappedOrder: Order = {
      externalId: order.id,
      status: 'READY_FOR_PROCESSING' as const,
      totalPaid: currency(order.payment.paidAmount?.amount || 0).intValue,
      totalToPay: currency(order.summary.totalToPay.amount).intValue,
      customer: validatedCustomer,
      recipient: validatedRecipient,
      delivery: validatedDelivery,
      packages: order.delivery.calculatedNumberOfPackages || 1,
      positions: [
         ...order.lineItems.map((i) => ({
            quantity: i.quantity,
            price: currency(i.price.amount).intValue,
            offer: {
               src: 'allegro',
               externalId: i.offer.id,
            },
         })),
         ...[
            currency(order.delivery.cost.amount).intValue !== 0
               ? {
                    quantity: 1,
                    price: currency(order.delivery.cost.amount).intValue,
                    offer: { src: 'allegro', externalId: 'delivery' },
                 }
               : null,
         ].filter((v): v is NonNullable<typeof v> => v !== null),
      ],
      src: 'allegro',
      paymentMethod: order.payment.type === 'ONLINE' ? 'PREPAID' : 'POSTPAID',
      fulfilledAt: null,
      preparedAt: new Date(order.updatedAt),
      createdAt: new Date(),
      clientTag: order.id,
   };

   const validatedOrder = v.parse(orderValidationSchema, mappedOrder);

   return validatedOrder;
}
