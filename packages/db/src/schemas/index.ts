import { defineRelations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const customersTable = sqliteTable('customers', {
   id: int().primaryKey({ autoIncrement: true }),
   firstName: text('first_name'),
   lastName: text('last_name'),
   companyName: text('company_name'),
   email: text(),
   phoneNumber: text(),
   externalId: text('external_id').unique(),
});

export const addressesTable = sqliteTable('addresses', {
   customerId: int('customer_id').references(() => customersTable.id),
   orderId: int('order_id'),
   postalCode: text('postal_code').notNull(),
   street: text().notNull(),
   apartament: text(),
   countryCode: text('country_tag').notNull(),
   city: text().notNull(),
});

export const ordersTable = sqliteTable('orders', {
   id: int().primaryKey({ autoIncrement: true }),
   customerId: int('customer_id')
      .notNull()
      .references(() => customersTable.id),
   externalId: text('external_id').unique().notNull(),
   status: text().notNull(),
   totalToPay: int('total_to_pay').notNull(),
   totalPaid: int('total_paid').notNull(),
   packages: int().notNull().default(1),
   fulfilledAt: int('fulfilled_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
   preparedAt: int('prepared_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
   createdAt: int('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
});

export const receiptsTable = sqliteTable('receipts', {
   id: int().primaryKey({ autoIncrement: true }),
   orderId: int('order_id').references(() => ordersTable.id),
   number: text().notNull().unique(),
   fiscalNumber: int('fiscal_number'),
   recipientFirstName: text('recipient_first_name').notNull(),
   recipientLastName: text('recipient_last_name').notNull(),
   paymentMethod: text('payment_method').notNull(),
   totalPaid: int('total_paid').notNull(),
   packagesMade: int('packages_made').notNull(),
   clientTag: text('client_tag'),
   createdAt: int('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
});

export const positionsTable = sqliteTable(
   'positions',
   {
      id: int().primaryKey({ autoIncrement: true }),
      receiptId: int('receipt_id').references(() => receiptsTable.id),
      orderId: int('order_id')
         .notNull()
         .references(() => ordersTable.id),
      offerId: int('offer_id')
         .notNull()
         .references(() => offersTable.id),

      title: text().notNull(),
      quantity: int().notNull(),
      price: int().notNull(),
      clientTag: text('client_tag'),
   },
   (t) => [primaryKey({ columns: [t.receiptId, t.orderId, t.offerId] })],
);

export const productsTable = sqliteTable('products', {
   id: int().primaryKey({ autoIncrement: true }),
   externalId: text('external_id').notNull().unique(),
   name: text().notNull(),
   imgSrc: text('image_source'),
   tax: int().$type<0 | 8 | 23>().notNull(),
   stock: int().notNull().default(0),
});

export const offersTable = sqliteTable('offers', {
   id: int().primaryKey({ autoIncrement: true }),
   externalId: text('external_id').notNull().unique(),
   src: text('source').notNull(),
   title: text().notNull(),
   imgSrc: text('image_source').notNull(),
   approved: int('approved', { mode: 'boolean' }).default(false).notNull(),
});

export const itemsTable = sqliteTable(
   'items',
   {
      offerId: int('offer_id')
         .notNull()
         .references(() => offersTable.id),
      productId: int('product_id')
         .notNull()
         .references(() => productsTable.id),
      quantity: int().notNull(),
   },
   (t) => [primaryKey({ columns: [t.offerId, t.productId] })],
);

export const relations = defineRelations(
   {
      receiptsTable,
      positionsTable,
      productsTable,
      itemsTable,
      offersTable,
      ordersTable,
      customersTable,
      addressesTable,
   },
   (r) => ({
      customersTable: {
         address: r.one.addressesTable({
            from: r.addressesTable.customerId,
            to: r.customersTable.id,
         }),
         orders: r.many.ordersTable({
            from: r.ordersTable.customerId,
            to: r.customersTable.id,
         }),
      },
      addressesTable: {
         habitant: r.one.customersTable(),
         order: r.one.ordersTable(),
      },
      ordersTable: {
         customer: r.one.customersTable(),
         receipt: r.one.receiptsTable({
            from: r.receiptsTable.orderId,
            to: r.ordersTable.id,
         }),
         positions: r.many.offersTable({
            from: r.ordersTable.id.through(r.positionsTable.orderId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
         }),
         deliveryAddress: r.one.addressesTable({
            from: r.addressesTable.orderId,
            to: r.ordersTable.id,
         }),
      },
      receiptsTable: {
         positions: r.many.offersTable({
            from: r.receiptsTable.id.through(r.positionsTable.receiptId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
         }),
         order: r.one.ordersTable(),
      },
      positionsTable: {
         orderId: r.one.ordersTable({
            from: r.positionsTable.offerId,
            to: r.ordersTable.id,
            optional: false,
         }),
         receiptId: r.one.receiptsTable({
            from: r.positionsTable.receiptId,
            to: r.receiptsTable.id,
            optional: false,
         }),
         offerId: r.one.offersTable({
            from: r.positionsTable.offerId,
            to: r.offersTable.id,
            optional: false,
         }),
      },
      offersTable: {
         items: r.many.productsTable({
            from: r.offersTable.id.through(r.itemsTable.offerId),
            to: r.productsTable.id.through(r.itemsTable.productId),
         }),
         receipts: r.many.receiptsTable(),
      },
      productsTable: {
         items: r.many.offersTable(),
      },
      itemsTable: {
         offer: r.one.offersTable({
            from: r.itemsTable.offerId,
            to: r.offersTable.id,
            optional: false,
         }),
         product: r.one.productsTable({
            from: r.itemsTable.productId,
            to: r.productsTable.id,
            optional: false,
         }),
      },
   }),
);
