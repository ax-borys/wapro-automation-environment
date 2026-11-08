import { productsTable } from '@wae/db';
import { diffProducts, mapBySrcExternalId } from '@wae/kernel';
import {
   Product,
   ProductInput,
   productInputSchema,
   productSchema,
   Tx,
} from '@wae/types';
import { eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';
import { removeProductsById } from './remove-products';

const syncableProductSchema = v.pick(productInputSchema, [
   'externalId',
   'src',
   'tax',
   'name',
   'stock',
   'imgSrc',
]);

export const syncProductsInputSchema = v.array(syncableProductSchema);
const syncProductsReturnSchema = v.array(productSchema);

export type SyncProductsInput = v.InferOutput<typeof syncProductsInputSchema>;
export type SyncProductsReturn = v.InferOutput<typeof syncProductsReturnSchema>;

export type SyncProductsOptions = {
   scope?: Product['src'][];
};

export async function syncProducts(
   tx: Tx,
   unscopeProductsInput: SyncProductsInput,
   options?: SyncProductsOptions,
): Promise<SyncProductsReturn> {
   const scope = new Set(
      options?.scope?.length
         ? options.scope
         : unscopeProductsInput.map((productInput) => productInput.src),
   );

   if (!scope.size) return [];

   const productsInput = unscopeProductsInput.filter((productInput) =>
      scope.has(productInput.src),
   );

   const [productsInputByExternalId, keyOfProductsInputMap] =
      mapBySrcExternalId(productsInput);

   const storedProducts = await tx
      .select()
      .from(productsTable)
      .where(inArray(productsTable.src, [...scope]));

   const [updatedProducts, keyOfUpdatedProducts] = mapBySrcExternalId<Product>(
      [],
   );

   const handled: Set<string> = new Set();
   const toDelete: Set<Product['id']> = new Set();

   for (const storedProduct of storedProducts) {
      const productInput = productsInputByExternalId.get(
         keyOfProductsInputMap(storedProduct.src, storedProduct.externalId),
      );

      if (productInput) {
         const diff = diffProducts(productInput, storedProduct);

         if (diff.isDifferent) {
            const [updatedProduct] = await tx
               .update(productsTable)
               .set(diff.difference)
               .where(eq(productsTable.id, storedProduct.id))
               .returning();

            updatedProducts.set(
               keyOfUpdatedProducts(
                  updatedProduct.src,
                  updatedProduct.externalId,
               ),
               updatedProduct,
            );
         }

         handled.add(
            keyOfProductsInputMap(productInput.src, productInput.externalId),
         );
      } else {
         toDelete.add(storedProduct.id);
      }
   }

   if (toDelete.size) await removeProductsById(tx, [...toDelete]);

   const toInsert: SyncProductsInput = [];

   for (const productInput of productsInputByExternalId.values()) {
      if (
         handled.has(
            keyOfProductsInputMap(productInput.src, productInput.externalId),
         )
      )
         continue;

      toInsert.push(productInput);
   }

   const createdProducts = toInsert.length
      ? await tx
           .insert(productsTable)
           .values([...toInsert])
           .returning()
      : [];

   return [...updatedProducts.values(), ...createdProducts];
}
