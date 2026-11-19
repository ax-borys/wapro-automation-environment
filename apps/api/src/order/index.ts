import { Hono } from 'hono';
import * as allegro from '@wae/allegro';
import * as v from 'valibot';
import {
   addressSchema,
   ApiResponse,
   customerSchema,
   deliverySchema,
   FullOrder,
   fullOrderShema,
   invoiceSchema,
   receiptSchema,
   recipientSchema,
} from '@wae/types';
import {
   changeRequiredDocumentType,
   changeRequiredDocumentTypeInputSchema,
   fetchOrders,
   FetchOrdersFilterInput,
   fetchOrdersFilterSchema,
   fulfillOrders,
   getFulfilledOrdersByFilter,
   getFulfilledOrdersByFilterInputSchema,
   obtainDeliveries,
   obtainOrderInputSchema,
   obtainOrders,
   obtainRecipients,
} from '@wae/order';
import { db } from '@wae/db';
import { obtainAddresses } from '@wae/address';
import { obtainCustomers } from '@wae/customer';
import { valibotJsonMiddleware } from '../helpers/valibot-middleware';
import { createReceiptInputSchema, createReceipts } from '@wae/receipt';
import { approveInvoiceInputSchema, approveInvoices } from '@wae/invoice';
import { waproConfig } from '../receipt/wapro-config';
import { syncOffers } from '@wae/offer';

export const order = new Hono()
   .put(
      '/required-document-type',
      valibotJsonMiddleware(changeRequiredDocumentTypeInputSchema),
      async (c) => {
         const input = c.req.valid('json');

         const order = await db.transaction(async (tx) =>
            changeRequiredDocumentType(tx, input),
         );

         return c.json<ApiResponse<typeof order>>({
            data: order,
            error: null,
         });
      },
   )
   .post(
      '/fulfill/orders',

      valibotJsonMiddleware(
         v.pipe(
            v.array(
               v.union([createReceiptInputSchema, approveInvoiceInputSchema]),
            ),
            v.nonEmpty(),
         ),
      ),
      async (c) => {
         type CreateReceiptInput = v.InferOutput<
            typeof createReceiptInputSchema
         >;
         type ApproveInvoiceInput = v.InferOutput<
            typeof approveInvoiceInputSchema
         >;

         type Receipt = v.InferOutput<typeof receiptSchema>;
         type Invoice = v.InferOutput<typeof invoiceSchema>;

         const ordersDataInput = c.req.valid('json');

         const result = await db.transaction(async (tx) => {
            const createReceiptsInput: CreateReceiptInput[] = [];
            const approveInvoicesInput: ApproveInvoiceInput[] = [];

            ordersDataInput.forEach((orderDataInput) => {
               if ('fiscalNumber' in orderDataInput) {
                  createReceiptsInput.push(orderDataInput);
               } else {
                  approveInvoicesInput.push(orderDataInput);
               }
            });

            const receipts = createReceiptsInput.length
               ? await createReceipts(tx, createReceiptsInput, waproConfig)
               : [];

            const invoices = approveInvoicesInput.length
               ? await approveInvoices(tx, approveInvoicesInput)
               : [];

            const receiptsAndInvoices: (Receipt | Invoice)[] = [
               ...receipts,
               ...invoices,
            ];

            await fulfillOrders(
               tx,
               receiptsAndInvoices.map(({ orderId }) => ({ id: orderId })),
            );

            return receiptsAndInvoices;
         });

         return c.json<ApiResponse<typeof result>>({
            data: result,
            error: null,
         });
      },
   )
   .post(
      '/orders/fulfilled',
      valibotJsonMiddleware(getFulfilledOrdersByFilterInputSchema),
      async (c) => {
         const input = c.req.valid('json');

         const data = await getFulfilledOrdersByFilter(input);

         return c.json<ApiResponse<FullOrder[]>>({
            data,
            error: null,
         });
      },
   )
   .get('/orders/pending', async (c) => {
      const cursorName: Parameters<typeof allegro.fetchCursor>[0] =
         'processingOrders';
      const cursor = allegro.fetchCursor(cursorName);

      console.log('Fetching allegro orders...');
      const { orders: allegroOrders, cursor: newCursor } =
         await allegro.pullProcessingOrdersSince(cursor);
      console.log('Fetching succeeded.');

      const result = await db.transaction(async (tx) => {
         if (allegroOrders.length) {
            console.log('Synchronizating offers...');
            const involvedOffers =
               allegro.extractInvolvedOffersFromOrders(allegroOrders);

            await syncOffers(tx, involvedOffers);
            console.log('Synchronization succeeded.');
            console.log("Obtaining customers' addresses...");
            const customerAddresses = await obtainAddresses(
               tx,
               allegroOrders
                  .filter(
                     (
                        order,
                     ): order is typeof order & {
                        customer: typeof order.customer & {
                           address: NonNullable<typeof order.customer.address>;
                        };
                     } => order.customer.address !== null,
                  )
                  .map((order) => order.customer.address),
            );
            console.log('Obtaining succeeded.');

            console.log('Obtaining customers...');
            const customers = await obtainCustomers(
               tx,
               allegroOrders.map((order) => {
                  const customerAddress = order.customer.address
                     ? customerAddresses.find(
                          (address) => address.clientTag === order.clientTag,
                       )
                     : null;

                  return {
                     ...order.customer,
                     addressId: customerAddress ? customerAddress.id : null,
                  };
               }),
            );
            console.log('Obtaining succeeded.');

            console.log("Obtaining recipients' addresses...");
            const recipientAddresses = await obtainAddresses(
               tx,
               allegroOrders.map((order) => order.recipient.address),
            );
            console.log('Obtaining succeeded.');

            console.log('Obtaining recipients...');
            const recipients = await obtainRecipients(
               tx,
               allegroOrders.map((order) => {
                  const recipientAddress = v.parse(
                     addressSchema,
                     recipientAddresses.find(
                        (address) => address.clientTag === order.clientTag,
                     ),
                  );

                  return { ...order.recipient, addressId: recipientAddress.id };
               }),
            );
            console.log('Obtaining succeeded.');

            console.log("Obtaining deliveries' addresses...");
            const deliveryAddresses = await obtainAddresses(
               tx,
               allegroOrders.map((order) => order.delivery.address),
            );
            console.log('Obtaining succeeded.');

            console.log('Obtaining deliveries...');
            const deliveries = await obtainDeliveries(
               tx,
               allegroOrders.map((order) => {
                  const deliveryAddress = v.parse(
                     addressSchema,
                     deliveryAddresses.find(
                        (address) => address.clientTag === order.clientTag,
                     ),
                  );

                  return { ...order.delivery, addressId: deliveryAddress.id };
               }),
            );
            console.log('Obtaining succeeded.');

            console.log('Obtaining orders...');
            const validatedObtainOrdersInput = v.parse(
               v.pipe(v.array(obtainOrderInputSchema), v.nonEmpty()),
               allegroOrders.map((order) => {
                  const customer = v.parse(
                     customerSchema,
                     customers.find(
                        (customer) => customer.clientTag === order.clientTag,
                     ),
                  );

                  const recipient = v.parse(
                     recipientSchema,
                     recipients.find(
                        (recipient) => recipient.clientTag === order.clientTag,
                     ),
                  );

                  const delivery = v.parse(
                     deliverySchema,
                     deliveries.find(
                        (delivery) => delivery.clientTag === order.clientTag,
                     ),
                  );

                  return {
                     ...order,
                     customerId: customer.id,
                     recepientId: recipient.id,
                     deliveryId: delivery.id,
                  };
               }),
            );

            await obtainOrders(tx, validatedObtainOrdersInput);
         }

         console.log('Obtaining succeeded.');

         const fetchOrdersFilter = v.parse(fetchOrdersFilterSchema, {
            status: 'PROCESSING',
            createdAtGte:
               process.env.ALLEGRO_INITIAL_CURSOR_UPDATED_AT_ISO_DATE!, // it can be like this because there's validation in src/init-allegro-store.ts
         } satisfies FetchOrdersFilterInput);

         const orders = await fetchOrders(tx, fetchOrdersFilter);

         console.log('Validating orders....');
         const validatedOrders = v.parse(v.array(fullOrderShema), orders);
         console.log('Validation succeeded');

         return validatedOrders;
      });

      allegro.saveCursor(cursorName, newCursor);

      return c.json<ApiResponse<FullOrder[]>>({
         data: result,
         error: null,
      });
   })
   .get('/mock/orders/peinding', async (c) => {
      const orders = [
         {
            id: 1001,
            customerId: 501,
            fulfilledAt: new Date('2025-01-15T14:30:00Z'),
            customer: {
               id: 501,
               firstName: 'Anna',
               lastName: 'Kowalska',
               companyName: null,
               email: 'anna.kowalska@example.com',
               phoneNumber: '+48123456789',
               externalId: 'cust_ext_501',
            },
            positions: [
               {
                  orderId: 1001,
                  offer: {
                     id: 1,
                     externalId: '1',
                     src: 'curl',
                     title: 'Geforce RTX 5090',
                     imgSrc: 'http://localhost:8082/public/rtx5090.jpg',
                     approved: true,
                  },
                  quantity: 2,
                  price: 20000,
               },
               {
                  orderId: 1001,
                  offer: {
                     id: 2,
                     externalId: '2',
                     src: 'curl',
                     title: 'Geforce RTX 5080',
                     imgSrc: 'http://localhost:8082/public/rtx5080.png',
                     approved: true,
                  },
                  quantity: 1,
                  price: 6500,
               },
            ],
            externalId: 'order_ext_1001',
            src: 'shop_a',
            status: 'COMPLETED',
            totalToPay: 46500,
            totalPaid: 46500,
            paymentMethod: 'PREPAID' as const,
            deliveryAddress: {
               postalCode: '00-001',
               street: 'Marszałkowska 10',
               apartament: '4B',
               countryCode: 'PL',
               city: 'Warsaw',
            },
            packages: 1,
            preparedAt: new Date('2025-01-14T09:00:00Z'),
            createdAt: new Date('2025-01-12T10:15:00Z'),
         },
      ];

      return c.json<ApiResponse<typeof orders>>({
         data: orders,
         error: null,
      });
   });
