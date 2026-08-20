import { receiptsTable } from '@wae/db';
import { createInsertSchema } from 'drizzle-orm/valibot';

const saveReceiptInputScheme = createInsertSchema(receiptsTable);

export async function saveReceipts() {}
