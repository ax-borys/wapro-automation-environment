import { defineRelations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const receiptsTable = sqliteTable('receipts', {
   id: int().primaryKey({ autoIncrement: true }),
   orderId: int('order_id').notNull(),
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
      .default(new Date()),
});

export const positionsTable = sqliteTable('positions', {
   id: int().primaryKey({ autoIncrement: true }),
   receiptId: int('receipt_id')
      .notNull()
      .references(() => receiptsTable.id),
   offerId: int('offer_id')
      .notNull()
      .references(() => offersTable.id),

   title: text().notNull(),
   quantity: int().notNull(),
   price: int().notNull(),
   clientTag: text('client_tag'),
});

export const productsTable = sqliteTable('products', {
   id: int().primaryKey({ autoIncrement: true }),
   externalId: text('external_id').notNull().unique(),
   name: text().notNull(),
   imgSrc: text('image_source'),
   tax: int().$type<0 | 8 | 23>().notNull(),
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
   { receiptsTable, positionsTable, productsTable, itemsTable, offersTable },
   (r) => ({
      receiptsTable: {
         positions: r.many.offersTable({
            from: r.receiptsTable.id.through(r.positionsTable.receiptId),
            to: r.offersTable.id.through(r.positionsTable.offerId),
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
