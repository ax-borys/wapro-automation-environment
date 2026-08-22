import { db, itemsTable, productsTable } from '@wae/db';
import { AddItemInput, AddItemsReturn } from '../schemas';

export async function addItems(
   itemsData: AddItemInput[],
): Promise<AddItemsReturn> {
   const result = await db.transaction(async (tx) => {
      const products = await tx
         .insert(productsTable)
         .values(itemsData.map((i) => i.product))
         .returning();

      const items = await tx
         .insert(itemsTable)
         .values(
            itemsData.map((i, index) => ({
               ...i.item,
               productId: products[index].id,
            })),
         )
         .returning();

      return { items, products };
   });

   return result;
}
