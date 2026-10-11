import { char, int, mssqlTable, text } from 'drizzle-orm/mssql-core';

export const productsTable = mssqlTable('ARTYKUL', {
   id: int('ID_ARTYKULU').primaryKey(),
   name: text('NAZWA').notNull(),
   tax: char('VAT_SPRZEDAZY').notNull(),
   stock: int('STAN').notNull(),
});

export const tradeDocumentsTable = mssqlTable('DOKUMENT_HANDLOWY', {
   id: int('ID_DOKUMENTU_HANDLOWEGO').primaryKey(),
   number: text('NUMER').notNull().unique(),
});
