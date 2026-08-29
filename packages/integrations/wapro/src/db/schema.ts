import { char, int, mssqlTable, text } from 'drizzle-orm/mssql-core';

export const productsTable = mssqlTable('ARTYKUL', {
   id: int('ID_ARTYKULU').primaryKey(),
   name: text('NAZWA').notNull(),
   tax: char('VAT_SPRZEDAZY'),
});
