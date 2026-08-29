import { createSelectSchema } from 'drizzle-orm/valibot';
import { Offer } from '../schemas';
import { db, itemsTable, productsTable } from '@wae/db';
import * as v from 'valibot';
import { and, eq, inArray } from 'drizzle-orm';

const productOutputSchema = createSelectSchema(productsTable);

type Product = v.InferOutput<typeof productOutputSchema>;

export type GetAllOffersWithItemsOutput = (Offer & {
   items: (Product & { quantity: number })[];
})[];
export async function getAllOffersWithItems(): Promise<GetAllOffersWithItemsOutput> {
   const offersWithItems = await db.query.offersTable.findMany({
      with: {
         items: true,
      },
   });

   const items = await db
      .select()
      .from(itemsTable)
      .where(
         and(
            inArray(
               itemsTable.offerId,
               offersWithItems.map((o) => o.id),
            ),
            inArray(
               itemsTable.productId,
               offersWithItems.flatMap((o) => o.items.map((i) => i.id)),
            ),
         ),
      );

   const offersWithItemsAndQuantity = offersWithItems.map((o) => ({
      ...o,
      items: o.items.map((i) => ({
         ...i,
         quantity: items.find((i) => i.offerId === o.id)!.quantity,
      })),
   }));

   return offersWithItemsAndQuantity;
}
