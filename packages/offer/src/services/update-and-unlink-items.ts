import { createInsertSchema, createSelectSchema } from 'drizzle-orm/valibot';
import { db, itemsTable, offersTable } from '@wae/db';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { Tx } from '@wae/types';
import { invalidReference } from '@wae/error';

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
   tx: Tx,
   itemsInput: UpdateAndUnlinkItemsInput,
): Promise<Item[]> {
   const offer = await tx
      .select()
      .from(offersTable)
      .where(eq(offersTable.id, itemsInput.offerId));

   if (!offer) {
      throw invalidReference(
         `Offer with id=${itemsInput.offerId} does not exist`,
      );
   }

   const inputItemsByProductId = new Map(
      itemsInput.items.map((i) => [i.productId, i]),
   );

   const currentOfferItems = await tx
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.offerId, itemsInput.offerId));

   const newOfferItemsByProductId: Map<Item['productId'], Item> = new Map();

   for (const item of currentOfferItems) {
      const itemInput = inputItemsByProductId.get(item.productId);

      if (itemInput) {
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

         newOfferItemsByProductId.set(newItem.productId, newItem);
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

   const notAddedItems = itemsInput.items
      .filter((i) => !newOfferItemsByProductId.has(i.productId))
      .map((i) => ({ ...i, offerId: itemsInput.offerId }));

   if (notAddedItems.length) {
      const newItems = await tx
         .insert(itemsTable)
         .values(notAddedItems)
         .returning();

      newItems.forEach((newItem) =>
         newOfferItemsByProductId.set(newItem.productId, newItem),
      );
   }

   return [...newOfferItemsByProductId.values()];
}
