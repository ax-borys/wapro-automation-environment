import { defineRelations } from 'drizzle-orm';
import { AnySQLiteColumn, primaryKey, unique } from 'drizzle-orm/sqlite-core';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const customersTable = sqliteTable('customers', {
   id: int().primaryKey({ autoIncrement: true }),
   firstName: text('first_name'),
   lastName: text('last_name'),
   companyName: text('company_name'),
   email: text(),
   phoneNumber: text(),
   externalId: text('external_id').unique(),
   clientTag: text('client_tag'),
});

export const addressesTable = sqliteTable('addresses', {
   customerId: int('customer_id')
      .notNull()
      .references(() => customersTable.id),
   orderId: int('order_id'),
   postalCode: text('postal_code').notNull(),
   street: text().notNull(),
   apartament: text(),
   countryCode: text('country_tag').notNull(),
   city: text().notNull(),
   clientTag: text('client_tag'),
});

export const ordersTable = sqliteTable(
   'orders',
   {
      id: int().primaryKey({ autoIncrement: true }),
      customerId: int('customer_id')
         .notNull()
         .references(() => customersTable.id),
      externalId: text('external_id').notNull(),
      src: text('source').notNull(),
      status: text().notNull(),
      totalToPay: int('total_to_pay').notNull(),
      totalPaid: int('total_paid').notNull(),
      paymentMethod: text('payment_method').notNull(),
      packages: int().notNull().default(1),
      fulfilledAt: int('fulfilled_at', { mode: 'timestamp_ms' }).$defaultFn(
         () => new Date(),
      ),
      preparedAt: int('prepared_at', { mode: 'timestamp_ms' }).$defaultFn(
         () => new Date(),
      ),
      createdAt: int('created_at', { mode: 'timestamp_ms' })
         .notNull()
         .$defaultFn(() => new Date()),
      clientTag: text('client_tag'),
   },
   (t) => [unique('source_external_id').on(t.externalId, t.src)],
);

export const receiptsTable = sqliteTable('receipts', {
   id: int().primaryKey({ autoIncrement: true }),
   orderId: int('order_id')
      .notNull()
      .references(() => ordersTable.id),
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
      receiptId: int('receipt_id').references(() => receiptsTable.id),
      orderId: int('order_id')
         .notNull()
         .references(() => ordersTable.id),
      offerId: int('offer_id')
         .notNull()
         .references(() => offersTable.id),

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
         address: r.one.addressesTable(),
         orders: r.many.ordersTable(),
      },
      addressesTable: {
         habitant: r.one.customersTable({
            from: r.addressesTable.customerId,
            to: r.customersTable.id,
         }),
         order: r.one.ordersTable({
            from: r.addressesTable.orderId,
            to: r.ordersTable.id,
         }),
      },
      ordersTable: {
         customer: r.one.customersTable({
            from: r.ordersTable.customerId,
            to: r.customersTable.id,
         }),
         receipt: r.one.receiptsTable(),
         positions: r.many.offersTable({
            from: r.ordersTable.id.through(r.positionsTable.orderId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
         }),
         deliveryAddress: r.one.addressesTable(),
      },
      receiptsTable: {
         positions: r.many.offersTable({
            from: r.receiptsTable.id.through(r.positionsTable.receiptId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
         }),
         order: r.one.ordersTable({
            from: r.receiptsTable.orderId,
            to: r.ordersTable.id,
         }),
      },
      positionsTable: {
         order: r.one.ordersTable({
            from: r.positionsTable.orderId,
            to: r.ordersTable.id,
            optional: false,
         }),
         receipt: r.one.receiptsTable({
            from: r.positionsTable.receiptId,
            to: r.receiptsTable.id,
            optional: false,
         }),
         offer: r.one.offersTable({
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
