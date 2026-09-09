import { defineRelations } from 'drizzle-orm';
import { AnySQLiteColumn, primaryKey, unique } from 'drizzle-orm/sqlite-core';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const addressesTable = sqliteTable('addresses', {
   id: int().primaryKey({ autoIncrement: true }),
   postalCode: text('postal_code').notNull(),
   street: text().notNull(),
   countryCode: text('country_tag').notNull(),
   city: text().notNull(),
   clientTag: text('client_tag'),
});

export const customersTable = sqliteTable('customers', {
   id: int().primaryKey({ autoIncrement: true }),
   addressId: int().references(() => addressesTable.id),
   firstName: text('first_name'),
   lastName: text('last_name'),
   companyName: text('company_name'),
   email: text(),
   phoneNumber: text(),
   externalId: text('external_id').unique(),
   clientTag: text('client_tag'),
});

export const recipientsTable = sqliteTable('recipients', {
   id: int().primaryKey({ autoIncrement: true }),
   addressId: int()
      .notNull()
      .references(() => addressesTable.id),
   firstName: text('first_name'),
   lastName: text('last_name'),
   companyName: text('company_name'),
   email: text(),
   phoneNumber: text(),
   clientTag: text('client_tag'),
});

export const deliveriesTable = sqliteTable('deliveries', {
   id: int().primaryKey({ autoIncrement: true }),
   addressId: int()
      .notNull()
      .references(() => addressesTable.id),
   pointId: text('point_id'),
   pointName: text('point_name'),
   pointDescription: text('point_description'),
   clientTag: text('client_tag'),
});

export const ordersTable = sqliteTable(
   'orders',
   {
      id: int().primaryKey({ autoIncrement: true }),
      customerId: int('customer_id')
         .notNull()
         .references(() => customersTable.id),
      recepientId: int('recepient_id')
         .notNull()
         .references(() => recipientsTable.id),
      deliveryId: int('delivery_id')
         .notNull()
         .references(() => deliveriesTable.id),
      externalId: text('external_id').notNull(),
      src: text('source').notNull(),
      status: text()
         .$type<
            | 'NEW'
            | 'READY_FOR_PROCESSING'
            | 'PROCESSING'
            | 'PROCESSED'
            | 'FULFILLED'
            | 'CANCELLED'
         >()
         .notNull(),
      totalToPay: int('total_to_pay').notNull(),
      totalPaid: int('total_paid').notNull(),
      paymentMethod: text('payment_method')
         .$type<'PREPAID' | 'POSTPAID'>()
         .notNull(),
      packages: int().notNull().default(1),
      fulfilledAt: int('fulfilled_at', { mode: 'timestamp_ms' }),
      preparedAt: int('prepared_at', { mode: 'timestamp_ms' }).notNull(),
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
   fiscalNumber: text('fiscal_number').notNull().unique(),
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

export const offersTable = sqliteTable(
   'offers',
   {
      id: int().primaryKey({ autoIncrement: true }),
      externalId: text('external_id').notNull(),
      src: text('source').notNull(),
      title: text().notNull(),
      imgSrc: text('image_source').notNull(),
      approved: int('approved', { mode: 'boolean' }).default(false).notNull(),
   },

   (t) => [unique('source_external_id').on(t.externalId, t.src)],
);

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
      deliveriesTable,
      recipientsTable,
   },
   (r) => ({
      addressesTable: {
         customers: r.many.customersTable(),
         deliveries: r.many.deliveriesTable(),
         recepients: r.many.recipientsTable(),
      },
      deliveriesTable: {
         orders: r.many.ordersTable(),
         address: r.one.addressesTable({
            from: r.deliveriesTable.addressId,
            to: r.addressesTable.id,
         }),
      },
      customersTable: {
         address: r.one.addressesTable({
            from: r.customersTable.addressId,
            to: r.addressesTable.id,
         }),
         orders: r.many.ordersTable(),
      },
      recipientsTable: {
         address: r.one.addressesTable({
            from: r.recipientsTable.addressId,
            to: r.addressesTable.id,
         }),
         orders: r.many.ordersTable(),
      },
      ordersTable: {
         delivery: r.one.deliveriesTable({
            from: r.ordersTable.deliveryId,
            to: r.deliveriesTable.id,
         }),
         customer: r.one.customersTable({
            from: r.ordersTable.customerId,
            to: r.customersTable.id,
         }),
         recipient: r.one.recipientsTable({
            from: r.ordersTable.recepientId,
            to: r.recipientsTable.id,
         }),
         offers: r.many.offersTable({
            from: r.ordersTable.id.through(r.positionsTable.orderId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
         }),

         receipt: r.one.receiptsTable(),
         positions: r.many.positionsTable(),
      },
      receiptsTable: {
         offers: r.many.offersTable({
            from: r.receiptsTable.id.through(r.positionsTable.receiptId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
         }),
         order: r.one.ordersTable({
            from: r.receiptsTable.orderId,
            to: r.ordersTable.id,
         }),
         positions: r.many.positionsTable(),
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
         products: r.many.productsTable({
            from: r.offersTable.id.through(r.itemsTable.offerId),
            to: r.productsTable.id.through(r.itemsTable.productId),
         }),
         receipts: r.many.receiptsTable(),
         positions: r.many.positionsTable(),
         items: r.many.itemsTable(),
      },
      productsTable: {
         offers: r.many.offersTable(),
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
