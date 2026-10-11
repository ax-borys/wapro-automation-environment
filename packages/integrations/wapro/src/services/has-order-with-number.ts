import * as v from 'valibot';
import { tradeDocumentsTable } from '../db/schema';
import { tradeDocumentSchema } from '../schemas/trade-document';
import { dbWapro } from '..';
import { eq } from 'drizzle-orm';

export const hasOrderWithNumberInputSchema = v.pick(tradeDocumentSchema, [
   'number',
]);

type HasOrderWithNumberInputSchema = v.InferInput<
   typeof hasOrderWithNumberInputSchema
>;

export async function hasOrderWithNumber({
   number,
}: HasOrderWithNumberInputSchema): Promise<boolean> {
   const [document] = await dbWapro
      .select()
      .from(tradeDocumentsTable)
      .where(eq(tradeDocumentsTable.number, number));

   console.log('Document: ', document);

   return document ? true : false;
}
