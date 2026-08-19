import { defineRelations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const receiptsTable = sqliteTable('receipts', {
   id: int().primaryKey({ autoIncrement: true }),
   orderId: int('order_id').notNull(),
   number: text().notNull().unique(),
   fiscalNumber: int('fiscal_number').notNull().unique(),
   recipientFirstName: text('recipient_first_name').notNull(),
   recipientLastName: text('recipient_first_name').notNull(),
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
      productId: int()
         .notNull()
         .references(() => productsTable.id),
      title: text().notNull(),
      quantity: int().notNull(),
      tax: int().notNull(),
      price: int().notNull(),
   },
   (t) => [primaryKey({ columns: [t.receiptId, t.productId] })],
);

export const productsTable = sqliteTable('products', {
   id: int().primaryKey({ autoIncrement: true }),
   externalId: int(),
   name: text().notNull(),
   imgSrc: text('image_source').notNull(),
   tax: int().notNull(),
});

export const relations = defineRelations(
   { receiptsTable, positionsTable, productsTable },
   (r) => ({
      receiptsTable: {
         positions: r.many.productsTable({
            from: r.receiptsTable.id.through(r.positionsTable.receiptId),
            to: r.productsTable.id.through(r.positionsTable.productId),
         }),
      },
      productsTable: {
         receipts: r.many.receiptsTable(),
      },
   }),
);
