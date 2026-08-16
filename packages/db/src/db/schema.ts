import { defineRelations } from 'drizzle-orm';
import { text } from 'drizzle-orm/cockroach-core';
import { int, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core';

export const offersTable = sqliteTable('offers_table', {
   id: int().primaryKey(),
   name: text().notNull(),
});

export type Offer = typeof offersTable.$inferSelect;
export type OfferInput = typeof offersTable.$inferInsert;

export const productsTable = sqliteTable('products_table', {
   id: int().primaryKey(),
   name: text().notNull(),
   vat: text('vat', { enum: ['23', '8', '0'] }),
});

export type Product = typeof productsTable.$inferSelect;
export type ProductInput = typeof productsTable.$inferInsert;

export const productsOffersTable = sqliteTable(
   'prodcts_offers_table',
   {
      offerId: int()
         .notNull()
         .references(() => offersTable.id),
      productId: int()
         .notNull()
         .references(() => productsTable.id),
      quantity: int().notNull(),
   },
   (table) => [
      primaryKey({
         columns: [table.offerId, table.productId],
      }),
   ],
);

export type OfferToProduct = typeof productsOffersTable.$inferSelect;
export type OfferToProductInput = typeof productsOffersTable.$inferInsert;

export const relations = defineRelations(
   { offersTable, productsTable, productsOffersTable },
   (r) => ({
      offersTable: {
         products: r.many.productsTable({
            from: r.offersTable.id.through(r.productsOffersTable.offerId),
            to: r.productsTable.id.through(r.productsOffersTable.productId),
         }),
      },
      productsTable: {
         offers: r.many.offersTable(),
      },
   }),
);
