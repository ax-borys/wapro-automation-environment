import { itemsTable, productsTable } from '@wae/db';
import { Item, Product, productSchema, Tx } from '@wae/types';
import { inArray } from 'drizzle-orm';
import * as v from 'valibot';

const removeProductsInputSchema = v.array(productSchema.entries.id);

type RemoveProductsInput = v.InferOutput<typeof removeProductsInputSchema>;

export async function removeProductsById(
   tx: Tx,
   productIdsInput: RemoveProductsInput,
): Promise<{ items: Item[]; products: Product[] }> {
   if (!productIdsInput.length) return { items: [], products: [] };

   const items = await tx
      .delete(itemsTable)
      .where(inArray(itemsTable.productId, productIdsInput))
      .returning();

   const products = await tx
      .delete(productsTable)
      .where(inArray(productsTable.id, productIdsInput))
      .returning();

   return { items, products };
}
