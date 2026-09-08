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
      ...v.omit(customerFullSchema, ['clientTag', 'id', 'addressId']).entries,
      address: v.nullable(v.omit(addressSchema, ['id', 'clientTag'])),
   }),
   v.object({
      ...v.omit(customerWithFullNameSchema, ['clientTag', 'id', 'addressId'])
         .entries,
      address: v.nullable(v.omit(addressSchema, ['id', 'clientTag'])),
   }),
   v.object({
      ...v.omit(customerWithCompanyNameSchema, ['clientTag', 'id', 'addressId'])
         .entries,
      address: v.nullable(v.omit(addressSchema, ['id', 'clientTag'])),
   }),
]);

const recipientSchema = v.union([
   v.object({
      ...v.omit(recipientFullSchema, ['clientTag', 'id', 'addressId']).entries,
      address: v.nullable(v.omit(addressSchema, ['id', 'clientTag'])),
   }),
   v.object({
      ...v.omit(recipientWithFullNameSchema, ['clientTag', 'id', 'addressId'])
         .entries,
      address: v.nullable(v.omit(addressSchema, ['id', 'clientTag'])),
   }),
   v.object({
      ...v.omit(recipientWithCompanyNameSchema, [
         'clientTag',
         'id',
         'addressId',
      ]).entries,
      address: v.nullable(v.omit(addressSchema, ['id', 'clientTag'])),
   }),
]);

export const deliveryWithAddressSchema = v.object({
   ...v.omit(deliverySchema, ['id', 'addressId']).entries,
   address: v.omit(addressSchema, ['id', 'clientTag']),
});

export const orderValidationSchema = v.object({
   ...v.omit(orderSchema, [
      'id',
      'customerId',
      'clientTag',
      'recepientId',
      'deliveryId',
   ]).entries,
   customer: customerSchema,
   recipient: recipientSchema,
   delivery: v.nullable(deliveryWithAddressSchema),
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
   };

   const validatedCustomerAddress = v.safeParse(
      v.omit(addressSchema, ['clientTag', 'id']),
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
   };

   const validatedRecipientAddress = v.parse(
      v.omit(addressSchema, ['clientTag', 'id']),
      recipientAddress,
   );

   const recipient: Order['recipient'] = {
      address: validatedRecipientAddress,
      companyName: order.delivery.address.companyName,
      firstName: order.delivery.address.firstName,
      lastName: order.delivery.address.lastName,
      email: null,
      phoneNumber: order.delivery.address.phoneNumber,
   };

   const validatedRecipient = v.parse(recipientSchema, recipient);

   const pickupPointAddress = {
      city: order.delivery.pickupPoint?.address?.city,
      street: order.delivery.pickupPoint?.address?.street,
      countryCode: order.delivery.pickupPoint?.address?.countryCode,
      postalCode: order.delivery.pickupPoint?.address?.zipCode,
   };

   const validatedPickupPointAddress = v.safeParse(
      v.omit(addressSchema, ['id', 'clientTag']),
      pickupPointAddress,
   );

   const delivery: Order['delivery'] | null =
      validatedPickupPointAddress.success
         ? {
              pointId: order.delivery.pickupPoint?.id || null,
              pointName: order.delivery.pickupPoint?.name || null,
              pointDescription: order.delivery.pickupPoint?.description || null,
              address: validatedPickupPointAddress.output,
           }
         : null;

   const validatedDelivery = v.parse(
      v.nullable(deliveryWithAddressSchema),
      delivery,
   );

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
   };

   const validatedOrder = v.parse(orderValidationSchema, mappedOrder);

   return validatedOrder;
}
