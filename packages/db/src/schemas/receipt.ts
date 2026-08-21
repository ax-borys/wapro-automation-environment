import { defineRelations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const receiptsTable = sqliteTable('receipts', {
   id: int().primaryKey({ autoIncrement: true }),
   orderId: int('order_id').notNull(),
   number: text().notNull().unique(),
   fiscalNumber: int('fiscal_number').notNull().unique(),
   recipientFirstName: text('recipient_first_name').notNull(),
   recipientLastName: text('recipient_last_name').notNull(),
   paymentMethod: text('payment_method').notNull(),
   totalPaid: int('total_paid').notNull(),
   packagesMade: int('packages_made').notNull(),
});

export const positionsTable = sqliteTable(
   'positions',
   {
      receiptId: int('receipt_id')
         .notNull()
         .references(() => receiptsTable.id),
      offerId: int('offer_id')
         .notNull()
         .references(() => productsTable.id),
      quantity: int().notNull(),
      price: int().notNull(),
   },
   (t) => [primaryKey({ columns: [t.receiptId, t.offerId] })],
);

export const productsTable = sqliteTable('products', {
   id: int().primaryKey({ autoIncrement: true }),
   externalId: int().unique(),
   name: text().notNull(),
   imgSrc: text('image_source'),
   tax: int().notNull(),
});

export const offersTable = sqliteTable('offers', {
   id: int().primaryKey({ autoIncrement: true }),
   externalId: int('external_id').unique(),
   src: text('source').notNull(),
   title: text().notNull(),
   imgSrc: text('image_source'),
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
   }),
);
