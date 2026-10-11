import { createSelectSchema } from 'drizzle-orm/valibot';
import { tradeDocumentsTable } from '../db/schema';

export const tradeDocumentSchema = createSelectSchema(tradeDocumentsTable);
