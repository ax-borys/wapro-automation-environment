import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import { db, itemsTable, offersTable } from '@wae/db';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';

const offerInputSchema = createInsertSchema(offersTable);
const itemInputSchema = createInsertSchema(itemsTable);

export const updateAndUnlinkItemsSchema = v.object({
   offerId: v.nonNullish(v.pick(offerInputSchema, ['id']).entries.id),
   items: v.array(v.omit(itemInputSchema, ['offerId'])),
});

export type UpdateAndUnlinkItemsInput = v.InferInput<
   typeof updateAndUnlinkItemsSchema
>;

const itemOutputSchema = createSelectSchema(itemsTable);

type Item = v.InferOutput<typeof itemOutputSchema>;
export type UpdateAndUnlinkItemsOutput = Item[];

export async function updateAndUnlinkItems(
   itemsInput: UpdateAndUnlinkItemsInput,
): Promise<Item[]> {
   const currentOfferItems = await db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.offerId, itemsInput.offerId));

   const newOfferItems: Item[] = await db.transaction(async (tx) => {
      const result: Item[] = [];

      for (const item of currentOfferItems) {
         if (
            itemsInput.items.map((i) => i.productId).includes(item.productId)
         ) {
            const itemInput = {
               ...itemsInput.items.find((i) => i.productId === item.productId)!,
            };

            const [newItem] = await tx
               .update(itemsTable)
               .set({ quantity: itemInput.quantity })
               .where(
                  and(
                     eq(itemsTable.offerId, item.offerId),
                     eq(itemsTable.productId, item.productId),
                  ),
               )
               .returning();

            result.push(newItem);
         } else {
            await tx
               .delete(itemsTable)
               .where(
                  and(
                     eq(itemsTable.productId, item.productId),
                     eq(itemsTable.offerId, item.offerId),
                  ),
               );
         }
      }

      return result;
   });

   const notAddedItems = itemsInput.items
      .filter(
         (i) => !newOfferItems.map((j) => j.productId).includes(i.productId),
      )
      .map((i) => ({ ...i, offerId: itemsInput.offerId }));

   if (notAddedItems.length) {
      const newItems = await db
         .insert(itemsTable)
         .values(notAddedItems)
         .returning();
      newItems.forEach((i) => newOfferItems.push(i));
   }

   return newOfferItems;
}
